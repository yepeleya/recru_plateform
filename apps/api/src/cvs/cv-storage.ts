import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

// MVP : PDF uniquement (plus simple à sécuriser et à tester ; DOC/DOCX plus tard).
const ALLOWED_MIME_TYPES = ['application/pdf'];
export const MAX_CV_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

// Options Multer pour l'import d'un CV — même principe que les pièces d'identité :
// fichier écrit dans le dossier privé (jamais servi statiquement), renommé en UUID
// pour ne pas exposer le nom d'origine ni permettre de traversée de chemin, filtré
// par type MIME et taille. Le nom d'origine est conservé séparément en base
// (Cv.fileName) pour l'affichage uniquement.
export function cvMulterOptions(config: ConfigService) {
  const uploadDir = config.get<string>('UPLOAD_DIR') ?? './uploads/private';
  fs.mkdirSync(uploadDir, { recursive: true });

  return {
    storage: diskStorage({
      destination: uploadDir,
      filename: (_req, _file, callback) => {
        callback(null, `${randomUUID()}.pdf`);
      },
    }),
    fileFilter: (
      _req: unknown,
      file: Express.Multer.File,
      callback: (error: Error | null, accept: boolean) => void,
    ) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        callback(new BadRequestException('Le CV doit être un fichier PDF.'), false);
        return;
      }
      callback(null, true);
    },
    limits: { fileSize: MAX_CV_FILE_SIZE },
  };
}
