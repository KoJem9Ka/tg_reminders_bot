import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const CancelKeyboard: Markup.Markup<ReplyKeyboardMarkup> = Markup.keyboard([[
  Markup.button.callback('Отмена', 'back'),
]]).resize();
