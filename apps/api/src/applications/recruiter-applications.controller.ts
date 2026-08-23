import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplicationsService } from './applications.service';

type AuthReq = { user: { userId: string; role: string } };

// Vue recruteur des candidatures. Chaque accès est restreint aux offres
// appartenant au recruteur connecté (règles 8 & 9) — vérifié côté service.
@Controller('recruiter/applications')
@UseGuards(JwtAuthGuard)
export class RecruiterApplicationsController {
  constructor(private readonly apps: ApplicationsService) {}

  // Candidatures reçues sur les offres du recruteur (option ?offerId=… pour filtrer).
  @Get()
  async list(@Req() req: AuthReq, @Query('offerId') offerId?: string) {
    return { applications: await this.apps.listForRecruiter(req.user.userId, offerId) };
  }

  // Détail d'une candidature reçue — 404 si elle ne porte pas sur une de ses offres.
  @Get(':id')
  async detail(@Req() req: AuthReq, @Param('id') id: string) {
    return { application: await this.apps.getRecruiterDetail(req.user.userId, id) };
  }
}
