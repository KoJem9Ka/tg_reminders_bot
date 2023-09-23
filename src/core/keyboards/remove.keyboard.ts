import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const RemoveKeyboard: Markup.Markup<ReplyKeyboardMarkup> = Markup.keyboard([[]]).resize();
