import {
  Ctx, Hears, Message, Wizard, WizardStep,
} from 'nestjs-telegraf';
import { ReminderScenesEnum } from '../enums/reminder-scenes.enum';
import { ReminderService } from '../services/reminder.service';
import { CancelKeyboard } from '../../core/keyboards/cancel.keyboard';
import { ReminderEditWizardContext } from '../contexts/reminder-edit.wizard-context';
import { StartKeyboard } from '../../core/keyboards/start.keyboard';
import { ReminderRepository } from '../services/reminder.repository';

@Wizard(ReminderScenesEnum.ReminderEditTextWizardID)
export class ReminderEditTextWizard {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly reminderService: ReminderService,
  ) {}

  @WizardStep(1)
  async onWizardEnter(@Ctx() ctx: ReminderEditWizardContext) {
    await ctx.reply(`
Введите новый текст напоминания:
${this.reminderService.printReminder(ctx.wizard.state.reminder)}
    `.trim(), CancelKeyboard);
    ctx.wizard.next();
  }

  @WizardStep(2)
  async onReminderText(
    @Ctx() ctx: ReminderEditWizardContext,
    @Message() msg: { text: string },
  ) {
    ctx.wizard.state.reminder.text = msg.text;
    const reminder = await this.reminderRepository.reminderSoftUpdate(ctx.wizard.state.reminder.id, { text: msg.text });
    await ctx.reply('Текст напоминания изменён:', StartKeyboard);
    await this.reminderService.sendReminder(ctx, reminder);
    await ctx.scene.leave();
  }

  @Hears(/^\/?(cancel|отмена|отменить)$/i)
  async onCancel(@Ctx() ctx: ReminderEditWizardContext) {
    await ctx.reply('Изменение текста напоминания отменено', StartKeyboard);
    await this.reminderService.sendReminder(ctx, ctx.wizard.state.reminder);
    await ctx.scene.leave();
  }
}
