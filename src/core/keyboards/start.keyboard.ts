import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const StartKeyboard: Markup.Markup<ReplyKeyboardMarkup> = Markup.keyboard([[
  Markup.button.callback('Новое напоминание', 'add'),
  Markup.button.callback('Список напоминаний', 'list'),
]]).resize();
