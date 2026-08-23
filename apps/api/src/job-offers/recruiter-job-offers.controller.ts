import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobOffersService } from './job-offers.service';

type AuthReq = { user: { userId: string; role: string } };

// Vue recruteur de SES propres offres (tous statuts, y compris brouillons/fermées).
@Controller('recruiter/job-offers')
@UseGuards(JwtAuthGuard)
export class RecruiterJobOffersController {
  constructor(private readonly offers: JobOffersService) {}

  @Get()
  async listMine(@Req() req: AuthReq) {
    return { items: await this.offers.listMine(req.user.userId) };
  }

  @Get(':id')
  async detail(@Req() req: AuthReq, @Param('id') id: string) {
    return { offer: await this.offers.getMineById(req.user.userId, id) };
  }
}
