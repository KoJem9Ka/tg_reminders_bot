import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const ReminderInlineKeyboard = (reminderId: string): Markup.Markup<InlineKeyboardMarkup> => Markup.inlineKeyboard([[
  Markup.button.callback('Изменить текст', `edit_text_${reminderId}`),
  Markup.button.callback('Изменить дату', `edit_date_${reminderId}`),
], [
  Markup.button.callback('Задать периодичность', `edit_period_${reminderId}`),
  Markup.button.callback('Удалить', `delete_${reminderId}`),
]]);
