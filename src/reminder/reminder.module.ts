import { Module } from '@nestjs/common';
import { ReminderUpdate } from './services/reminder.update';
import { ReminderCreateWizard } from './wizards/reminder-create.wizard';
import { ReminderService } from './services/reminder.service';
import { ReminderEditTextWizard } from './wizards/reminder-edit-text.wizard';
import { ReminderEditDateWizard } from './wizards/reminder-edit-date.wizard';
import { ReminderEditPeriodWizard } from './wizards/reminder-edit-period.wizard';
import { ReminderSenderService } from './services/reminder-sender.service';
import { ReminderRepository } from './services/reminder.repository';

@Module({
  providers: [
    ReminderUpdate,
    ReminderRepository,
    ReminderService,
    ReminderSenderService,

    ReminderCreateWizard,
    ReminderEditTextWizard,
    ReminderEditDateWizard,
    ReminderEditPeriodWizard,
  ],
})
export class ReminderModule {}
