import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const ResetOrCancelKeyboard: Markup.Markup<ReplyKeyboardMarkup> = Markup.keyboard([[
  Markup.button.callback('Сброс', 'reset'),
  Markup.button.callback('Отмена', 'back'),
]]).resize();
