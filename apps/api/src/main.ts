import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app-setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Middlewares, pipes, filtre et préfixe — partagés avec les tests HTTP.
  configureApp(app);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}
bootstrap();
