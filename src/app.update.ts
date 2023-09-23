import {
  Ctx, Hears, Help, Message, Start, Update,
} from 'nestjs-telegraf';
import { ru as chrono } from 'chrono-node';
import { TelegrafBotContext } from './core/telegraf-bot-context';
import { StartKeyboard } from './core/keyboards/start.keyboard';
import { PrismaService } from './prisma/prisma.service';

@Update()
export class AppUpdate {
  /**
   * Обработчик команды /start.
   * @param ctx Текущий контекст.
   */
  @Start()
  @Hears(/^\/?(начать|привет|старт|хай|хелло|здравствуй|start|hi|hello)!*$/i)
  @Help()
  @Hears(/^\/?(помощь|помоги|help|команды|commands)$/i)
  async start(@Ctx() ctx: TelegrafBotContext) {
    await ctx.reply(`
👋 Привет!
👾 Я бот для удобной работы с напоминаниями.
⚡ Выберите действие под строкой ввода.
    `.trim(), StartKeyboard);
    await ctx.telegram.deleteMyCommands();
  }

  @Hears(/дата .+/i)
  async date(
    @Ctx() ctx: TelegrafBotContext,
    @Message() msg: { text: string },
  ) {
    await ctx.reply(`Date: ${chrono.parseDate(msg.text).toISOString()}`);
    // await ctx.replyWithHTML(`reminders: <code>${getJSON(reminders, 2)}</code>`);
  }
}
