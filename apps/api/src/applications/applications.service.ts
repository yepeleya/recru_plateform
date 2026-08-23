import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

// Sélections sûres — on n'expose jamais de champ sensible (hash, clé de stockage).
const OFFER_SUMMARY = {
  id: true,
  slug: true,
  title: true,
  status: true,
  city: true,
  metierSlug: true,
  type: true,
} satisfies Prisma.JobOfferSelect;

const CV_SUMMARY = {
  id: true,
  source: true,
  fileName: true,
  title: true,
} satisfies Prisma.CvSelect;

const CANDIDATE_SUMMARY = {
  id: true,
  firstName: true,
  lastName: true,
  city: true,
} satisfies Prisma.UserSelect;

const APPLICATION_BASE = {
  id: true,
  candidateId: true,
  jobOfferId: true,
  cvId: true,
  status: true,
  message: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ApplicationSelect;

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Candidat : postuler ---
  async create(userId: string, dto: CreateApplicationDto) {
    const offer = await this.prisma.jobOffer.findUnique({
      where: { id: dto.jobOfferId },
      select: { id: true, recruiterId: true, status: true },
    });
    if (!offer) throw new NotFoundException('Offre introuvable.');

    // Règle 3 : on ne postule pas à sa propre offre.
    if (offer.recruiterId === userId) {
      throw new ForbiddenException('Vous ne pouvez pas postuler à votre propre offre.');
    }

    // Règle 4 : seule une offre publiée accepte des candidatures.
    if (offer.status !== 'published') {
      throw new ConflictException({
        message: 'Cette offre n’accepte plus de candidatures.',
        code: 'OFFER_NOT_OPEN',
      });
    }

    // Règle CV : le CV utilisé est le CV actif réellement enregistré pour ce
    // candidat. Sans CV, on refuse avec un code exploitable par le frontend pour
    // orienter vers « Importer » / « Créer » — on n'invente jamais un CV.
    const cv = await this.prisma.cv.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!cv) {
      throw new UnprocessableEntityException({
        message: 'Ajoutez un CV pour postuler.',
        code: 'CV_REQUIRED',
      });
    }

    // Règle 1 : une seule candidature par (candidat, offre). Contrôle explicite
    // pour un message clair, la contrainte unique DB servant de garde-fou (race).
    const existing = await this.prisma.application.findUnique({
      where: { candidateId_jobOfferId: { candidateId: userId, jobOfferId: offer.id } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException({
        message: 'Vous avez déjà postulé à cette offre.',
        code: 'DUPLICATE_APPLICATION',
      });
    }

    try {
      return await this.prisma.application.create({
        data: {
          candidateId: userId,
          jobOfferId: offer.id,
          cvId: cv.id,
          message: dto.message,
        },
        select: { ...APPLICATION_BASE, jobOffer: { select: OFFER_SUMMARY }, cv: { select: CV_SUMMARY } },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException({
          message: 'Vous avez déjà postulé à cette offre.',
          code: 'DUPLICATE_APPLICATION',
        });
      }
      throw e;
    }
  }

  // --- Candidat : mes candidatures ---
  listMine(userId: string) {
    return this.prisma.application.findMany({
      where: { candidateId: userId },
      orderBy: { createdAt: 'desc' },
      select: { ...APPLICATION_BASE, jobOffer: { select: OFFER_SUMMARY }, cv: { select: CV_SUMMARY } },
    });
  }

  async getMineDetail(userId: string, id: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      select: { ...APPLICATION_BASE, jobOffer: { select: OFFER_SUMMARY }, cv: { select: CV_SUMMARY } },
    });
    // 404 (et non 403) pour un tiers : on ne révèle pas l'existence des
    // candidatures d'autrui.
    if (!app || app.candidateId !== userId) throw new NotFoundException('Candidature introuvable.');
    return app;
  }

  // --- Recruteur : candidatures reçues sur SES offres uniquement ---
  listForRecruiter(recruiterId: string, offerId?: string) {
    return this.prisma.application.findMany({
      // Le filtre relationnel garantit qu'un recruteur ne voit jamais les
      // candidatures des offres d'un autre recruteur (règles 8 & 9).
      where: {
        jobOffer: { recruiterId, ...(offerId ? { id: offerId } : {}) },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        ...APPLICATION_BASE,
        candidate: { select: CANDIDATE_SUMMARY },
        jobOffer: { select: OFFER_SUMMARY },
        cv: { select: CV_SUMMARY },
      },
    });
  }

  async getRecruiterDetail(recruiterId: string, id: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      select: {
        ...APPLICATION_BASE,
        candidate: { select: CANDIDATE_SUMMARY },
        jobOffer: { select: { ...OFFER_SUMMARY, recruiterId: true } },
        cv: { select: CV_SUMMARY },
      },
    });
    if (!app || app.jobOffer.recruiterId !== recruiterId) {
      throw new NotFoundException('Candidature introuvable.');
    }
    // On ne renvoie pas recruiterId dans la réponse finale.
    const { recruiterId: _r, ...jobOffer } = app.jobOffer;
    return { ...app, jobOffer };
  }
}
