import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UploadsModule } from './uploads/uploads.module';
import { CvsModule } from './cvs/cvs.module';
import { ApplicationsModule } from './applications/applications.module';
import { JobOffersModule } from './job-offers/job-offers.module';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100, // défaut global ; limites plus strictes sur les routes auth
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    UploadsModule,
    CvsModule,
    ApplicationsModule,
    JobOffersModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
