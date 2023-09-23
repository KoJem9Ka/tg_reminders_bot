import {
  Ctx, Hears, Message, TelegrafException, Wizard, WizardStep,
} from 'nestjs-telegraf';
import ms from 'ms';
import { isNumber } from 'lodash';
import { ReminderScenesEnum } from '../enums/reminder-scenes.enum';
import { ReminderService } from '../services/reminder.service';
import { ReminderEditWizardContext } from '../contexts/reminder-edit.wizard-context';
import { StartKeyboard } from '../../core/keyboards/start.keyboard';
import { ReminderInlineKeyboard } from '../../core/keyboards/reminder.inline-keyboard';
import { ruToMs, ruToWeekDayEnums } from '../../common/parse-interval';
import { ResetOrCancelKeyboard } from '../../core/keyboards/reset-or-cancel.keyboard';
import { ReminderRepository } from '../services/reminder.repository';
import { REMINDER_INTERVAL_LESS10SEC_ERROR, REMINDER_PERIOD_PARSE_ERROR } from '../../core/lang';

@Wizard(ReminderScenesEnum.ReminderEditPeriodWizardID)
export class ReminderEditPeriodWizard {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly reminderService: ReminderService,
  ) {}

  @WizardStep(1)
  async onWizardEnter(@Ctx() ctx: ReminderEditWizardContext) {
    await ctx.replyWithHTML(`
Как часто повторять напоминание?

${this.reminderService.printReminder(ctx.wizard.state.reminder)}

Например: <i>каждые 30 секунд</i>; <i>каждый час</i>; <i>каждые полчаса</i>; <i>каждый час и 30 минут</i>; <i>каждые 1.5 часа</i>; <i>каждый год</i>.
Или так: <i>По понедельникам</i>; <i>Каждую среду и четверг</i>; <i></i>; <i>Пн, вт и ср</i>; <i>По выходным</i>.

Или введите <i>сброс</i> для отключения повтора.
    `.trim(), ResetOrCancelKeyboard);
    ctx.wizard.next();
  }

  @WizardStep(2)
  async onReminderPeriodic(
    @Ctx() ctx: ReminderEditWizardContext,
    @Message() msg: { text: string },
  ) {
    const interval = ruToMs(msg.text);
    const days = ruToWeekDayEnums(msg.text);
    if (!interval && !days) {
      throw new TelegrafException(REMINDER_PERIOD_PARSE_ERROR);
    }
    if (isNumber(interval) && interval < ms('10s')) {
      throw new TelegrafException(REMINDER_INTERVAL_LESS10SEC_ERROR);
    }
    const reminder = await this.reminderRepository.reminderFullUpdate(ctx.wizard.state.reminder.id, {
      isRepeatEnabled: true,
      repeatMs: interval?.toString() || null,
      repeatDays: days?.size ? Array.from(days) : [],
    });
    await ctx.reply('Интервал повтора изменён:', StartKeyboard);
    await this.reminderService.sendReminder(ctx, reminder);
    await ctx.scene.leave();
  }

  @Hears(/^\/?(cancel|отмена|отменить)$/i)
  async onCancel(@Ctx() ctx: ReminderEditWizardContext) {
    await ctx.reply('Редактирование повтора напоминания отменено', StartKeyboard);
    await ctx.reply(this.reminderService.printReminder(ctx.wizard.state.reminder), ReminderInlineKeyboard(ctx.wizard.state.reminder.id));
    await ctx.scene.leave();
  }

  @Hears(/^\/?(reset|сбросить|сброс)[ _]?(интервала?|interval)?$/i)
  async onReset(@Ctx() ctx: ReminderEditWizardContext) {
    const reminder = await this.reminderRepository.reminderFullUpdate(ctx.wizard.state.reminder.id, {
      isRepeatEnabled: false,
      repeatMs: null,
      repeatDays: [],
      sentAt: ctx.wizard.state.reminder.sentAt ? ctx.wizard.state.reminder.targetDate : null,
    });
    await ctx.reply('Повтор напоминания отключен:', StartKeyboard);
    await this.reminderService.sendReminder(ctx, reminder);
    await ctx.scene.leave();
  }
}
