import { MiddlewareFn } from 'telegraf/typings/middleware';
import { TelegrafException } from 'nestjs-telegraf';
import { TelegrafBotContext } from '../telegraf-bot-context';

export const TelegrafErrorMiddleware: MiddlewareFn<TelegrafBotContext> = async (
  ctx,
  next,
) => next().catch(async (err) => {
  const error = err as Error;
  if (error instanceof TelegrafException) {
    await ctx.reply(error.message);
  } else {
    await ctx.reply(`❌ К сожалению, во время обработки запроса возникла непредвиденная ошибка: ${error.message}.`);
    await ctx.scene.leave();
  }
});
