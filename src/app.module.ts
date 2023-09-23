import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { Postgres } from '@telegraf/session/pg';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReminderModule } from './reminder/reminder.module';
import { ConfigService } from './config/config.service';
import { PrismaService } from './prisma/prisma.service';
import { AppUpdate } from './app.update';
import { TelegrafContextMiddleware } from './core/middlewares/telegraf-context.middleware';
import { TelegrafErrorMiddleware } from './core/middlewares/telegraf-error.middleware';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ReminderModule,
    TelegrafModule.forRootAsync({
      inject: [ConfigService, PrismaService],
      useFactory: (configService: ConfigService, prisma: PrismaService) => ({
        token: configService.config.telegram.botToken,
        middlewares: [
          TelegrafContextMiddleware(prisma),
          session({ store: Postgres(configService.config.database) }),
          TelegrafErrorMiddleware,
        ],
      }),
    }),
  ],
  providers: [AppUpdate],
})
export class AppModule {}
