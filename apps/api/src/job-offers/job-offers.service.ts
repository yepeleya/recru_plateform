import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

export interface PublicOfferFilters {
  page?: number;
  pageSize?: number;
  metier?: string;
  city?: string;
  type?: string;
  q?: string;
}

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 12;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

@Injectable()
export class JobOffersService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Recruteur : créer ---
  async create(userId: string, dto: CreateJobOfferDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { accountType: true },
    });
    // Seuls les recruteurs publient des offres ; un candidat postule, il ne recrute pas.
    if (!user || user.accountType === 'candidat') {
      throw new ForbiddenException('Seuls les recruteurs peuvent publier une offre.');
    }

    const slug = `${slugify(dto.title) || 'offre'}-${randomUUID().slice(0, 8)}`;
    return this.prisma.jobOffer.create({
      data: {
        slug,
        title: dto.title,
        description: dto.description,
        metierSlug: dto.metierSlug,
        type: dto.type,
        city: dto.city,
        area: dto.area,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        budgetLabel: dto.budgetLabel,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: 'draft',
        recruiterId: userId,
      },
    });
  }

  // --- Public : liste des offres PUBLIÉES (paginée + filtrée) ---
  async listPublic(filters: PublicOfferFilters) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(filters.pageSize) || DEFAULT_PAGE_SIZE));

    const where: Prisma.JobOfferWhereInput = {
      status: 'published',
      ...(filters.metier ? { metierSlug: filters.metier } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.city ? { city: { contains: filters.city } } : {}),
      ...(filters.q ? { title: { contains: filters.q } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobOffer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.jobOffer.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  // --- Public : détail d'une offre publiée uniquement ---
  async getPublicById(id: string) {
    const offer = await this.prisma.jobOffer.findUnique({ where: { id } });
    // Une offre non publiée (brouillon/fermée) n'est pas visible publiquement.
    if (!offer || offer.status !== 'published') {
      throw new NotFoundException('Offre introuvable.');
    }
    return offer;
  }

  // --- Recruteur : ses offres (tous statuts) ---
  listMine(userId: string) {
    return this.prisma.jobOffer.findMany({
      where: { recruiterId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMineById(userId: string, id: string) {
    const offer = await this.loadOwned(userId, id);
    return offer;
  }

  // --- Recruteur : modifier (propriétaire uniquement) ---
  async update(userId: string, id: string, dto: UpdateJobOfferDto) {
    await this.loadOwned(userId, id);
    return this.prisma.jobOffer.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        metierSlug: dto.metierSlug,
        type: dto.type,
        city: dto.city,
        area: dto.area,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        budgetLabel: dto.budgetLabel,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async publish(userId: string, id: string) {
    await this.loadOwned(userId, id);
    return this.prisma.jobOffer.update({ where: { id }, data: { status: 'published' } });
  }

  async close(userId: string, id: string) {
    await this.loadOwned(userId, id);
    return this.prisma.jobOffer.update({ where: { id }, data: { status: 'closed' } });
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.loadOwned(userId, id);
    // Cascade DB : supprime aussi les candidatures liées (FK onDelete Cascade).
    await this.prisma.jobOffer.delete({ where: { id } });
    return { ok: true };
  }

  // Charge une offre en garantissant l'appartenance au recruteur connecté :
  // 404 si l'offre n'existe pas, 403 si elle appartient à un autre recruteur.
  private async loadOwned(userId: string, id: string) {
    const offer = await this.prisma.jobOffer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    if (offer.recruiterId !== userId) throw new ForbiddenException();
    return offer;
  }
}
