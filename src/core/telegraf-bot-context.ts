import { Scenes } from 'telegraf';

/**
 * Контекст Telegraf бота приложения.
 */
export interface TelegrafBotContext extends Scenes.SceneContext {
  /**
   * Полезная нагрузка для команды /start.
   */
  startPayload?: string;

  /**
   * Текущее состояние.
   */
  state: {
    /**
     * Идентификатор пользователя во внутренней системе.
     */
    userId?: string;
  };
}
