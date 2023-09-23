import { WizardContext } from 'telegraf/typings/scenes';
import { reminder as ReminderEntity } from '@prisma/client';
import { TelegrafBotContext } from '../../core/telegraf-bot-context';

export type ReminderEditWizardContext = WizardContext & TelegrafBotContext & {
  wizard: {
    state: {
      reminder: ReminderEntity;
    };
  }
};
