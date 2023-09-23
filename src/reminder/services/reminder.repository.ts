import { Injectable } from '@nestjs/common';
import { TelegrafException } from 'nestjs-telegraf';
import { id } from 'date-fns/locale';
import { PrismaService } from '../../prisma/prisma.service';
import { ReminderSenderService } from './reminder-sender.service';
import { ReminderService } from './reminder.service';
import { REMINDER_FIND_NOT_FOUND_ERROR, REMINDER_UPDATE_NOT_FOUND_ERROR } from '../../core/lang';
import { ReminderEntity } from '../entities/reminder.entity';

@Injectable()
export class ReminderRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reminderService: ReminderService,
    private readonly reminderSenderService: ReminderSenderService,
  ) {}

  public async findByIdOrThrow(reminderId: string): Promise<ReminderEntity> {
    return this.prisma.reminder.findUniqueOrThrow({ where: { id: reminderId } }).catch(() => {
      throw new TelegrafException(REMINDER_FIND_NOT_FOUND_ERROR);
    });
  }

  public async fetchReminderUserTelegramId(reminderId: string): Promise<number> {
    return this.prisma.reminder.findUniqueOrThrow({
      where: { id: reminderId },
      select: { user: { select: { telegramId: true } } },
    }).then((r) => r.user.telegramId).catch(() => {
      throw new TelegrafException(REMINDER_FIND_NOT_FOUND_ERROR);
    });
  }

  public async reminderCreate(args: {
    userId: string
    text: string
    targetDate: Date
  }): Promise<ReminderEntity> {
    const reminder = this.prisma.reminder.create({
      data: {
        user: { connect: { id: args.userId } },
        text: args.text,
        targetDate: args.targetDate,
        nextSendAt: args.targetDate,
      },
    });
    await this.reminderSenderService.restartTimeout();
    return reminder;
  }

  public async reminderFullUpdate(reminderId: string, data: Partial<ReminderEntity>): Promise<ReminderEntity> {
    const reminder = await this.prisma.reminder.update({
      where: { id: reminderId },
      data: this.reminderService.calcNextSendAt({
        ...await this.findByIdOrThrow(reminderId),
        ...data,
      }),
    }).catch(() => {
      throw new TelegrafException(REMINDER_UPDATE_NOT_FOUND_ERROR);
    });
    await this.reminderSenderService.restartTimeout();
    return reminder;
  }

  public async reminderSoftUpdate(reminderId: string, data: Partial<ReminderEntity>): Promise<ReminderEntity> {
    return this.prisma.reminder.update({
      where: { id: reminderId },
      data,
    }).catch(() => {
      throw new TelegrafException(REMINDER_UPDATE_NOT_FOUND_ERROR);
    });
  }
}
