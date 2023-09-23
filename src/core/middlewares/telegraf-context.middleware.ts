import { MiddlewareFn } from 'telegraf/typings/middleware';
import { TelegrafBotContext } from '../telegraf-bot-context';
import { PrismaService } from '../../prisma/prisma.service';

export const TelegrafContextMiddleware = (
  prisma: PrismaService,
): MiddlewareFn<TelegrafBotContext> => async (
  ctx,
  next,
) => {
  if (ctx.from) {
    const user = await prisma.user.findFirst({
      where: { telegramId: ctx.from.id },
      select: { id: true },
    });
    if (user) {
      ctx.state.userId = user.id;
    } else {
      await prisma.user.create({
        data: { telegramId: ctx.from.id },
        select: { id: true },
      }).then((newUser) => {
        ctx.state.userId = newUser.id;
      });
    }
  }
  return next();
};
