import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as () => ReturnType<typeof import('cookie-parser')>;
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.use(helmet());
  app.use(cookieParser());

  const allowedOrigins = (process.env.WEB_APP_URL ?? 'http://localhost:3100')
    .split(',')
    // Accepte localhost et 127.0.0.1 pour chaque origine configurée (même
    // machine, mais le navigateur les traite comme des origines différentes).
    .flatMap((o) => [o.trim(), o.trim().replace('://localhost', '://127.0.0.1')]);
  const isProd = process.env.NODE_ENV === 'production';
  // Autorise n'importe quel port localhost/127.0.0.1 EN DÉVELOPPEMENT uniquement :
  // le front dev tourne sur un port variable (3100, 3200…), et un port non
  // whitelisté produisait un échec CORS interprété à tort comme « pas d'internet ».
  // La prod conserve la whitelist stricte (WEB_APP_URL).
  const localhostDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  app.enableCors({
    origin: (origin, callback) => {
      // Pas d'Origin (curl, same-origin, outils serveur) → autorisé.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (!isProd && localhostDev.test(origin)) return callback(null, true);
      return callback(new Error(`Origine non autorisée par CORS: ${origin}`), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Versionné dès le départ pour permettre une évolution sans rupture (CLAUDE.md Partie 4 §9).
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}
bootstrap();
