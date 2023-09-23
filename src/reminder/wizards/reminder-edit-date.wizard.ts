import {
  Ctx, Hears, Message, Wizard, WizardStep,
} from 'nestjs-telegraf';
import { ReminderScenesEnum } from '../enums/reminder-scenes.enum';
import { ReminderService } from '../services/reminder.service';
import { CancelKeyboard } from '../../core/keyboards/cancel.keyboard';
import { ReminderEditWizardContext } from '../contexts/reminder-edit.wizard-context';
import { StartKeyboard } from '../../core/keyboards/start.keyboard';
import { ReminderRepository } from '../services/reminder.repository';
import { REMINDER_INPUT_DATE } from '../../core/lang';

@Wizard(ReminderScenesEnum.ReminderEditDateWizardID)
export class ReminderEditDateWizard {
  constructor(
    private readonly reminderService: ReminderService,
    private readonly reminderRepository: ReminderRepository,
  ) {}

  @WizardStep(1)
  async onWizardEnter(@Ctx() ctx: ReminderEditWizardContext) {
    await ctx.replyWithHTML(`
${REMINDER_INPUT_DATE}

${this.reminderService.printReminder(ctx.wizard.state.reminder)}
    `.trim(), CancelKeyboard);
    ctx.wizard.next();
  }

  @WizardStep(2)
  async onReminderDate(
    @Ctx() ctx: ReminderEditWizardContext,
    @Message() msg: { text: string },
  ) {
    const targetDate = await this.reminderService.validateReceivedReminderDate(ctx, msg.text);
    const reminder = await this.reminderRepository.reminderFullUpdate(ctx.wizard.state.reminder.id, { targetDate, sentAt: null });
    await ctx.reply('Дата напоминания изменёна:', StartKeyboard);
    await this.reminderService.sendReminder(ctx, reminder);
    await ctx.scene.leave();
  }

  @Hears(/^\/?(cancel|отмена|отменить)$/i)
  async onCancel(@Ctx() ctx: ReminderEditWizardContext) {
    await ctx.reply('Изменение даты напоминания отменено', StartKeyboard);
    await this.reminderService.sendReminder(ctx, ctx.wizard.state.reminder);
    await ctx.scene.leave();
  }
}
