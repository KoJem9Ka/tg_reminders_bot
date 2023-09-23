/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/consistent-type-definitions */
// noinspection JSUnusedGlobalSymbols

/**
 * Global environment variables of process.env.*
 */
namespace NodeJS {
  import { EnvironmentEnum } from './config/environment.enum';

  type ProcessEnv = {
    /**
     * App environment mode
     */
    MODE: EnvironmentEnum;
    /**
     * App Rest API port
     */
    PORT: string;
    /**
     * Telegram bot token
     */
    BOT_TOKEN: string;
    /**
     * Database host
     */
    DB_HOST: string;
    /**
     * Database port
     */
    DB_PORT: string;
    /**
     * Database name
     */
    DB_DATABASE: string;
    /**
     * Database username
     */
    DB_USER: string;
    /**
     * Database password
     */
    DB_PASSWORD: string;
    /**
     * Database URL
     */
    DB_URL: string;
  };
}
