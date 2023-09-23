import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import './common/dayjs-configured';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { config: { port } } = await app.resolve(ConfigService);
  await app.listen(3000);
  console.log(`App successfully launched in ${process.env.MODE.toUpperCase()} mode on port ${port}`);
}
bootstrap();
