import {
  Action, Ctx, Hears, Message, Update,
} from 'nestjs-telegraf';
import { isArray } from 'lodash';
import { TelegrafBotContext } from '../../core/telegraf-bot-context';
import { ReminderScenesEnum } from '../enums/reminder-scenes.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { ReminderInlineKeyboard } from '../../core/keyboards/reminder.inline-keyboard';
import { ReminderService } from './reminder.service';
import { getJSON } from '../../common/utils';

@Update()
export class ReminderUpdate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reminderService: ReminderService,
  ) {}

  @Hears(/^\/?(напомни|remind|добавить|add|создать|create|новое|new)[ _]?(напоминание|reminder)?$/i)
  async add(@Ctx() ctx: TelegrafBotContext) {
    await ctx.scene.enter(ReminderScenesEnum.ReminderCreateWizardID, { reminder: {} });
  }

  @Hears(/^\/?(напоминания|reminders|список|list|все|all)[ _]?(напоминани(й|я)|reminders)?$/i)
  async list(@Ctx() ctx: TelegrafBotContext) {
    const reminders = await this.prisma.reminder.findMany({
      where: { userId: ctx.state.userId },
      orderBy: { targetDate: 'asc' },
    });
    if (reminders.length === 0) {
      await ctx.reply('У вас нет ни одного напоминания');
      return;
    }
    for (const reminder of reminders) {
      await ctx.reply(this.reminderService.printReminder(reminder), ReminderInlineKeyboard(reminder.id));
    }
  }

  @Action(/delete_(.+)/i)
  async delete(@Ctx() ctx: TelegrafBotContext) {
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    if (!('match' in ctx) || !isArray(ctx.match) || ctx.match.length < 2) {
      return;
    }
    const reminderId = ctx.match[1] as string;
    const reminder = await this.prisma.reminder.findUnique({
      where: { id: reminderId },
    });
    if (!reminder) {
      await ctx.reply('Напоминание не найдено');
      return;
    }
    await this.prisma.reminder.delete({ where: { id: reminderId } });
    await ctx.reply(`
🗑️ Напоминание удалено ❗:

${this.reminderService.printReminder(reminder)}
    `.trim());
  }

  @Action(/edit_text_(.+)/i)
  async editText(@Ctx() ctx: TelegrafBotContext) {
    await this.reminderService.enterReminderEditScene(ctx, ReminderScenesEnum.ReminderEditTextWizardID);
  }

  @Action(/edit_date_(.+)/i)
  async editDate(@Ctx() ctx: TelegrafBotContext) {
    await this.reminderService.enterReminderEditScene(ctx, ReminderScenesEnum.ReminderEditDateWizardID);
  }

  @Action(/edit_period_(.+)/i)
  async editPeriod(@Ctx() ctx: TelegrafBotContext) {
    await this.reminderService.enterReminderEditScene(ctx, ReminderScenesEnum.ReminderEditPeriodWizardID);
  }

  @Hears(/(update|up|обновить) .+/i)
  async update(
    @Ctx() ctx: TelegrafBotContext,
    @Message() msg: { text: string },
  ) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id: msg.text.split(' ')[1] } });
    if (!reminder) {
      await ctx.reply('Напоминание не найдено');
      return;
    }
    const updatedReminder = await this.prisma.reminder.update({
      where: { id: reminder.id },
      data: this.reminderService.calcNextSendAt(reminder),
    });
    await ctx.replyWithHTML(`Напоминание обновлено:\n${this.reminderService.printReminder(updatedReminder)}\n\n<code>${getJSON(updatedReminder, 2)}</code>`);
  }
}
