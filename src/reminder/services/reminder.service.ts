import { Injectable } from '@nestjs/common';
import {
  get, isDate, sortBy, sortedUniq,
} from 'lodash';
import { reminder as ReminderEntity } from '@prisma/client';
import dayjs from 'dayjs';
import { ru as chrono } from 'chrono-node';
import ms from 'ms';
import { TelegrafException } from 'nestjs-telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegrafBotContext } from '../../core/telegraf-bot-context';
import { CancelKeyboard } from '../../core/keyboards/cancel.keyboard';
import {
  getWeekDay, msToRu, weekDayEnumsToRu, weekDayEnumToNumber,
} from '../../common/parse-interval';
import {
  REMINDER_DATE_IN_PAST_ERROR,
  REMINDER_DATE_LESS10SEC_ERROR,
  REMINDER_DATE_PARSE_ERROR,
  REMINDER_FIND_NOT_FOUND_ERROR,
  REMINDER_ID_FROM_CTX_ACTION_ERROR,
} from '../../core/lang';
import { ReminderScenesEnum } from '../enums/reminder-scenes.enum';
import { ReminderInlineKeyboard } from '../../core/keyboards/reminder.inline-keyboard';

@Injectable()
export class ReminderService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchReminderFromCtxMatch(ctx: TelegrafBotContext): Promise<ReminderEntity> {
    const reminderId = get(ctx, 'match[1]', '') as string;
    if (!reminderId) {
      throw new TelegrafException(REMINDER_ID_FROM_CTX_ACTION_ERROR);
    }
    return this.prisma.reminder.findUniqueOrThrow({ where: { id: reminderId } }).catch(() => {
      throw new TelegrafException(REMINDER_FIND_NOT_FOUND_ERROR);
    });
  }

  public async sendReminder(ctx: TelegrafBotContext, reminder: ReminderEntity) {
    await ctx.reply(this.printReminder(reminder), ReminderInlineKeyboard(reminder.id));
  }

  public readonly printReminder = (reminder: ReminderEntity) => {
    let text = `
💡 ${reminder.text}
📅 Дата: ${dayjs(reminder.targetDate).format('DD MMMM YYYYг. HH:mm')}
  `.trim();
    if (reminder.nextSendAt > new Date()) {
      text += `\n⏰ Через: ${msToRu(reminder.nextSendAt.getTime() - Date.now())}`;
    }
    if (reminder.repeatMs) {
      text += `\n🔄 Повтор: ${msToRu(Number(reminder.repeatMs))}`;
    }
    if (reminder.repeatDays.length) {
      text += `\n🔄 По дням: ${weekDayEnumsToRu(reminder.repeatDays)}`;
    }
    return text;
  };

  public validateReceivedReminderDate = async (ctx: TelegrafBotContext, messageText: string): Promise<Date> => {
    const date = chrono.parseDate(messageText);
    if (!isDate(date)) {
      throw new TelegrafException(REMINDER_DATE_PARSE_ERROR);
    }
    // const dayjsDate = dayjs(date);
    // if (dayjsDate.isBefore()) {
    //   throw new TelegrafException(REMINDER_DATE_IN_PAST_ERROR);
    // }
    // if (dayjsDate.isBefore(dayjs().add(10, 'seconds'))) {
    //   throw new TelegrafException(REMINDER_DATE_LESS10SEC_ERROR);
    // }
    return date;
  };

  public async enterReminderEditScene(ctx: TelegrafBotContext, sceneId: ReminderScenesEnum) {
    const [reminder] = await Promise.all([
      this.fetchReminderFromCtxMatch(ctx),
      ctx.answerCbQuery(),
      ctx.deleteMessage(),
    ]);
    await ctx.scene.enter(sceneId, { reminder });
  }

  public calcNextSendAt(reminder: ReminderEntity): ReminderEntity {
    let nextSendAt = reminder.targetDate;
    const nowDate = new Date();
    const nowMs = nowDate.getTime();
    if (reminder.sentAt && reminder.isRepeatEnabled) {
      const targetDateMs = reminder.targetDate.getTime();
      let nextSendMsFromRepeatMs: number = targetDateMs;
      if (reminder.repeatMs) {
        const repeatLeftMs = (nowMs - targetDateMs) % Number(reminder.repeatMs);
        nextSendMsFromRepeatMs = Math.max(targetDateMs, nowMs + Number(reminder.repeatMs) - repeatLeftMs);
      }
      const todayWeekDay = getWeekDay();
      const repeatDaysNumbers = reminder.repeatDays.map(weekDayEnumToNumber);
      let nextSendMsFromRepeatDays: number = targetDateMs;
      if (repeatDaysNumbers.length) {
        const today = todayWeekDay;
        const nextWeekDay = repeatDaysNumbers.find((day) => day > today) || repeatDaysNumbers[0];
        const daysLeft = (nextWeekDay - today + 7) % 7 || 7;
        const timestamp = nowMs - (nowMs % ms('1d')) + (nextSendAt.getTime() % ms('1d'));
        nextSendMsFromRepeatDays = Math.max(targetDateMs, timestamp + ms(`${daysLeft}d`));
      }
      const variants = sortedUniq(sortBy([targetDateMs, nextSendMsFromRepeatMs, nextSendMsFromRepeatDays]));
      nextSendAt = new Date(variants[1] || variants[0]);
    }
    return {
      ...reminder,
      nextSendAt,
      sentAt: reminder.sentAt && reminder.sentAt > nextSendAt ? null : reminder.sentAt,
    };
  }
}
