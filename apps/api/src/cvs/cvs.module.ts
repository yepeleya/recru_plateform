import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { CvsController } from './cvs.controller';
import { CvsService } from './cvs.service';
import { cvMulterOptions } from './cv-storage';

@Module({
  imports: [
    // Multer configuré au niveau du module (PDF-only, dossier privé, nom UUID) —
    // même approche que AuthModule pour les pièces d'identité.
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => cvMulterOptions(config),
    }),
  ],
  controllers: [CvsController],
  providers: [CvsService],
})
export class CvsModule {}
