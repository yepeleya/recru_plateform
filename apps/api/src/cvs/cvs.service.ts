import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import type { Cv } from '@prisma/client';
import { resolve, basename } from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { SaveCvDto } from './dto/save-cv.dto';

// Vue publique d'un CV : jamais la clé de stockage privé (`fileKey`).
export type PublicCv = Omit<Cv, 'fileKey'>;

@Injectable()
export class CvsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private uploadDir(): string {
    return this.config.get<string>('UPLOAD_DIR') ?? './uploads/private';
  }

  // Retire `fileKey` avant tout renvoi au frontend.
  private toPublic(cv: Cv): PublicCv {
    const { fileKey: _fileKey, ...rest } = cv;
    return rest;
  }

  // Suppression best-effort d'un fichier CV (remplacement / suppression du CV).
  // Un fichier déjà absent ne doit pas faire échouer l'opération.
  private async unlinkFileKey(fileKey: string | null): Promise<void> {
    if (!fileKey) return;
    const filePath = resolve(process.cwd(), this.uploadDir(), basename(fileKey));
    try {
      await fs.promises.unlink(filePath);
    } catch {
      // ENOENT ou permission : on ignore, la ligne DB reste la source de vérité.
    }
  }

  async getMine(userId: string): Promise<PublicCv | null> {
    const cv = await this.prisma.cv.findUnique({ where: { userId } });
    return cv ? this.toPublic(cv) : null;
  }

  // Autorisation de consultation d'un CV (règle 10) : le propriétaire, un admin,
  // ou un recruteur ayant reçu une candidature de ce candidat sur l'une de ses
  // offres. Aucun autre accès. La relation candidature est la SEULE façon pour un
  // recruteur d'ouvrir un CV — pas d'accès public.
  private async canAccess(cvOwnerId: string, requesterId: string, role: string): Promise<boolean> {
    if (cvOwnerId === requesterId) return true;
    if (role === 'ADMIN') return true;
    const count = await this.prisma.application.count({
      where: { candidateId: cvOwnerId, jobOffer: { recruiterId: requesterId } },
    });
    return count > 0;
  }

  // Consulter un CV par id (contenu structuré pour un CV généré ; métadonnées pour
  // un CV importé — le binaire passe par getFileForDownload). Même autorisation.
  async getById(requesterId: string, role: string, id: string): Promise<PublicCv> {
    const cv = await this.prisma.cv.findUnique({ where: { id } });
    if (!cv) throw new NotFoundException('CV introuvable.');
    if (!(await this.canAccess(cv.userId, requesterId, role))) {
      throw new ForbiddenException();
    }
    return this.toPublic(cv);
  }

  // Crée ou remplace le CV *généré* du candidat (un seul CV actif : upsert par userId).
  async saveGenerated(userId: string, dto: SaveCvDto): Promise<PublicCv> {
    this.assertHasPersonalInfo(dto.content);

    const existing = await this.prisma.cv.findUnique({ where: { userId } });
    // Passage d'un CV importé à un CV généré : on supprime l'ancien fichier PDF.
    if (existing?.source === 'imported') {
      await this.unlinkFileKey(existing.fileKey);
    }

    const content = dto.content as Prisma.InputJsonValue;
    const cv = await this.prisma.cv.upsert({
      where: { userId },
      create: {
        userId,
        title: dto.title ?? 'Mon CV',
        source: 'generated',
        templateId: dto.templateId ?? null,
        content,
      },
      update: {
        title: dto.title ?? 'Mon CV',
        source: 'generated',
        templateId: dto.templateId ?? null,
        content,
        // On nettoie les champs fichier hérités d'un éventuel CV importé.
        fileKey: null,
        fileName: null,
        mimeType: null,
        sizeBytes: null,
      },
    });
    return this.toPublic(cv);
  }

  // Met à jour un CV généré identifié par son id (contrôle d'appartenance strict).
  async updateGenerated(userId: string, id: string, dto: SaveCvDto): Promise<PublicCv> {
    const existing = await this.prisma.cv.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('CV introuvable.');
    if (existing.userId !== userId) throw new ForbiddenException();

    this.assertHasPersonalInfo(dto.content);
    if (existing.source === 'imported') {
      await this.unlinkFileKey(existing.fileKey);
    }

    const cv = await this.prisma.cv.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        source: 'generated',
        templateId: dto.templateId ?? null,
        content: dto.content as Prisma.InputJsonValue,
        fileKey: null,
        fileName: null,
        mimeType: null,
        sizeBytes: null,
      },
    });
    return this.toPublic(cv);
  }

  // Importe (ou remplace) le CV PDF du candidat. Le fichier a déjà été écrit par
  // Multer (dossier privé, nom UUID) et filtré par MIME/taille ; on vérifie ici
  // l'en-tête réel du fichier (%PDF-) avant de l'associer au compte.
  async importCv(
    userId: string,
    file: Express.Multer.File | undefined,
    title?: string,
  ): Promise<PublicCv> {
    if (!file) throw new BadRequestException('Aucun fichier reçu.');

    const isPdf = await this.hasPdfHeader(file.path);
    if (!isPdf) {
      await this.unlinkFileKey(file.filename);
      throw new BadRequestException('Le fichier fourni n’est pas un PDF valide.');
    }

    const existing = await this.prisma.cv.findUnique({ where: { userId } });
    // Remplacement : on supprime l'ancien fichier (CV importé) s'il existe.
    if (existing?.fileKey) {
      await this.unlinkFileKey(existing.fileKey);
    }

    const displayName = basename(file.originalname).slice(0, 255);
    const cv = await this.prisma.cv.upsert({
      where: { userId },
      create: {
        userId,
        title: title?.slice(0, 120) ?? displayName,
        source: 'imported',
        fileKey: file.filename,
        fileName: displayName,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
      update: {
        title: title?.slice(0, 120) ?? displayName,
        source: 'imported',
        fileKey: file.filename,
        fileName: displayName,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        // Un CV importé n'a pas de contenu structuré ni de modèle.
        content: Prisma.DbNull,
        templateId: null,
      },
    });
    return this.toPublic(cv);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    const existing = await this.prisma.cv.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('CV introuvable.');
    if (existing.userId !== userId) throw new ForbiddenException();

    await this.unlinkFileKey(existing.fileKey);
    await this.prisma.cv.delete({ where: { id } });
    return { ok: true };
  }

  // Résout le chemin d'un CV importé pour téléchargement, après contrôle d'accès
  // (propriétaire / admin / recruteur autorisé via une candidature — règle 10).
  async getFileForDownload(
    userId: string,
    role: string,
    id: string,
  ): Promise<{ filePath: string; fileName: string }> {
    const cv = await this.prisma.cv.findUnique({ where: { id } });
    if (!cv || cv.source !== 'imported' || !cv.fileKey) {
      throw new NotFoundException('CV introuvable.');
    }

    if (!(await this.canAccess(cv.userId, userId, role))) {
      throw new ForbiddenException();
    }

    const filePath = resolve(process.cwd(), this.uploadDir(), basename(cv.fileKey));
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier introuvable.');
    }
    return { filePath, fileName: cv.fileName ?? 'cv.pdf' };
  }

  // --- helpers ---

  private assertHasPersonalInfo(content: Record<string, unknown> | undefined): void {
    const personalInfo = content?.['personalInfo'];
    if (!personalInfo || typeof personalInfo !== 'object') {
      throw new BadRequestException('Le contenu du CV est invalide (personalInfo manquant).');
    }
  }

  private async hasPdfHeader(filePath: string): Promise<boolean> {
    let handle: fs.promises.FileHandle | undefined;
    try {
      handle = await fs.promises.open(filePath, 'r');
      const { buffer, bytesRead } = await handle.read(Buffer.alloc(5), 0, 5, 0);
      return bytesRead === 5 && buffer.toString('latin1') === '%PDF-';
    } catch {
      return false;
    } finally {
      await handle?.close();
    }
  }
}
