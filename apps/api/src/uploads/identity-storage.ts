import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

// Formats acceptés pour une pièce d'identité ou un RCCM.
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 Mo

// Options Multer pour le stockage des documents d'identité — fichiers écrits
// dans un dossier privé (jamais servi statiquement), renommés en UUID pour ne
// jamais exposer le nom de fichier original ni permettre une traversée de
// chemin, et filtrés par type MIME + taille.
export function identityMulterOptions(config: ConfigService) {
  const uploadDir = config.get<string>('UPLOAD_DIR') ?? './uploads/private';
  fs.mkdirSync(uploadDir, { recursive: true });

  return {
    storage: diskStorage({
      destination: uploadDir,
      filename: (_req, file, callback) => {
        callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
      },
    }),
    fileFilter: (_req: unknown, file: Express.Multer.File, callback: (error: Error | null, accept: boolean) => void) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        callback(new BadRequestException('Format de fichier non supporté (image ou PDF uniquement).'), false);
        return;
      }
      callback(null, true);
    },
    limits: { fileSize: MAX_FILE_SIZE },
  };
}
