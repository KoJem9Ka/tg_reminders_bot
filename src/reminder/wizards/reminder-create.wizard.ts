import {
  Ctx, Hears, Message, Wizard, WizardStep,
} from 'nestjs-telegraf';
import { isDate } from 'lodash';
import { ReminderScenesEnum } from '../enums/reminder-scenes.enum';
import { ReminderEditWizardContext } from '../contexts/reminder-edit.wizard-context';
import { CancelKeyboard } from '../../core/keyboards/cancel.keyboard';
import { StartKeyboard } from '../../core/keyboards/start.keyboard';
import { ReminderService } from '../services/reminder.service';
import { ReminderRepository } from '../services/reminder.repository';
import { REMINDER_INPUT_DATE } from '../../core/lang';

@Wizard(ReminderScenesEnum.ReminderCreateWizardID)
export class ReminderCreateWizard {
  constructor(
    private readonly reminderService: ReminderService,
    private readonly reminderRepository: ReminderRepository,
  ) {}

  @WizardStep(1)
  async onSceneEnter(
    @Ctx() ctx: ReminderEditWizardContext,
  ) {
    await ctx.reply('📝 Введите текст напоминания', CancelKeyboard);
    ctx.wizard.next();
  }

  @WizardStep(2)
  async onReminderText(
    @Ctx() ctx: ReminderEditWizardContext,
    @Message() msg: { text: string },
  ) {
    ctx.wizard.state.reminder.text = msg.text;
    await ctx.replyWithHTML(REMINDER_INPUT_DATE, CancelKeyboard);
    ctx.wizard.next();
  }

  @WizardStep(3)
  async onReminderDate(
    @Ctx() ctx: ReminderEditWizardContext,
    @Message() msg: { text: string },
  ) {
    const targetDate = await this.reminderService.validateReceivedReminderDate(ctx, msg.text);
    if (!isDate(targetDate)) {
      return;
    }
    ctx.wizard.state.reminder.targetDate = targetDate;
    const reminder = await this.reminderRepository.reminderCreate({
      userId: ctx.state.userId as string,
      text: ctx.wizard.state.reminder.text,
      targetDate: ctx.wizard.state.reminder.targetDate,
    });
    await ctx.reply('Добавлено напоминание:', StartKeyboard);
    await this.reminderService.sendReminder(ctx, reminder);
    await ctx.scene.leave();
  }

  @Hears(/^\/?(cancel|отмена|отменить)$/i)
  async onCancel(@Ctx() ctx: ReminderEditWizardContext) {
    await ctx.reply('Создание напоминания отменено', StartKeyboard);
    await ctx.scene.leave();
  }
}
