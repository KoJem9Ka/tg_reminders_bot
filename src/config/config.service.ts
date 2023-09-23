import { Injectable } from '@nestjs/common';
import type { ReadonlyDeep } from 'type-fest';
import { values } from 'lodash';
import { joi } from '../common/joi-configured';
import { EnvironmentEnum } from './environment.enum';

interface IAppConfig {
  mode: EnvironmentEnum;
  port: number;
  telegram: {
    botToken: string;
  },
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }
}

const AppConfigSchema = joi.object<IAppConfig>({
  mode: joi.string().equal(...values(EnvironmentEnum)).required(),
  port: joi.number().port(),
  telegram: joi.object<IAppConfig['telegram']>({
    botToken: joi.string(),
  }),
  database: joi.object<IAppConfig['database']>({
    host: joi.string(),
    port: joi.number().port(),
    database: joi.string(),
    user: joi.string(),
    password: joi.string(),
  }),
});

@Injectable()
export class ConfigService {
  private readonly envConfig: IAppConfig;

  constructor() {
    const { error, value } = AppConfigSchema.validate(<IAppConfig>{
      mode: process.env.MODE,
      port: process.env.PORT as unknown,
      telegram: {
        botToken: process.env.BOT_TOKEN,
      },
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT as unknown,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    });

    if (error) {
      throw new Error(`App configuration error: ${error.message}`);
    }

    this.envConfig = value;
  }

  get config(): ReadonlyDeep<IAppConfig> {
    return this.envConfig;
  }
}
