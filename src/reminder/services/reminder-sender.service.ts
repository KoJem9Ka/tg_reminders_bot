import {
  forwardRef, Inject, Injectable, Logger, OnModuleInit,
} from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import ms from 'ms';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegrafBotContext } from '../../core/telegraf-bot-context';
import { ReminderService } from './reminder.service';
import { ReminderInlineKeyboard } from '../../core/keyboards/reminder.inline-keyboard';
import { ReminderRepository } from './reminder.repository';

@Injectable()
export class ReminderSenderService implements OnModuleInit {
  private readonly logger = new Logger(ReminderSenderService.name);

  private timeoutId: ReturnType<typeof setInterval>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reminderService: ReminderService,
    @Inject(forwardRef(() => ReminderRepository)) private readonly reminderRepository: ReminderRepository,
    @InjectBot() private readonly bot: Telegraf<TelegrafBotContext>,
  ) {}

  public async restartTimeout() {
    clearTimeout(this.timeoutId);
    const nextReminder = await this.prisma.reminder.findFirst({
      where: {
        OR: [
          { nextSendAt: { gt: new Date() } },
          { sentAt: null, nextSendAt: { lte: new Date() } },
        ],
      },
      orderBy: { nextSendAt: 'asc' },
      select: { id: true, nextSendAt: true },
    });
    if (!nextReminder) {
      this.logger.log('No reminders to send, sender stopped');
      return;
    }
    const timeLeft = Math.max(0, nextReminder.nextSendAt.getTime() - Date.now() + ms('1s'));
    this.timeoutId = setTimeout(this.sendReminders.bind(this), timeLeft);
    this.logger.log(`Next reminder will be sent in ~${ms(timeLeft)} because of reminder ${nextReminder.id}`);
  }

  async onModuleInit() {
    await this.restartTimeout();
  }

  private async sendReminders() {
    const nowDate = new Date();
    const remindersForUpdate = await this.prisma.reminder.findMany({
      where: {
        AND: [
          { nextSendAt: { lt: nowDate } },
          {
            OR: [
              { sentAt: null },
              { sentAt: { not: { equals: this.prisma.reminder.fields.nextSendAt } } },
            ],
          },
        ],
      },
    });
    this.logger.log(`Sending reminders: ${remindersForUpdate.map((r) => r.id).join(', ')}`);
    const reminders = await Promise.all(remindersForUpdate.map(async (r) => {
      const reminder = await this.reminderRepository.reminderFullUpdate(r.id, { sentAt: r.nextSendAt });
      await this.bot.telegram.sendMessage(
        await this.reminderRepository.fetchReminderUserTelegramId(r.id),
        `🔔 Напоминаю 🔔\n${this.reminderService.printReminder(reminder)}`,
        ReminderInlineKeyboard(reminder.id),
      );
    }));
    this.logger.log(`Sent ${reminders.length} reminders`);
    await this.restartTimeout();
  }
}
