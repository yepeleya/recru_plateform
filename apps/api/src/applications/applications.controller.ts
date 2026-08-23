import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

type AuthReq = { user: { userId: string; role: string } };

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly apps: ApplicationsService) {}

  // Postuler à une offre.
  @Post()
  async create(@Req() req: AuthReq, @Body() dto: CreateApplicationDto) {
    return { application: await this.apps.create(req.user.userId, dto) };
  }

  // Mes candidatures (candidat connecté).
  @Get('me')
  async mine(@Req() req: AuthReq) {
    return { applications: await this.apps.listMine(req.user.userId) };
  }

  // Détail d'une de mes candidatures.
  @Get(':id')
  async detail(@Req() req: AuthReq, @Param('id') id: string) {
    return { application: await this.apps.getMineDetail(req.user.userId, id) };
  }
}
