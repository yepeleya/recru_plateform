import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobOffersService } from './job-offers.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

type AuthReq = { user: { userId: string; role: string } };

@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly offers: JobOffersService) {}

  // --- Public (sans auth) : browse marketplace ---
  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('metier') metier?: string,
    @Query('city') city?: string,
    @Query('type') type?: string,
    @Query('q') q?: string,
  ) {
    return this.offers.listPublic({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      metier,
      city,
      type,
      q,
    });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return { offer: await this.offers.getPublicById(id) };
  }

  // --- Recruteur propriétaire (auth) ---
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: AuthReq, @Body() dto: CreateJobOfferDto) {
    return { offer: await this.offers.create(req.user.userId, dto) };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Req() req: AuthReq, @Param('id') id: string, @Body() dto: UpdateJobOfferDto) {
    return { offer: await this.offers.update(req.user.userId, id, dto) };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  async publish(@Req() req: AuthReq, @Param('id') id: string) {
    return { offer: await this.offers.publish(req.user.userId, id) };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/close')
  async close(@Req() req: AuthReq, @Param('id') id: string) {
    return { offer: await this.offers.close(req.user.userId, id) };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: AuthReq, @Param('id') id: string) {
    return this.offers.remove(req.user.userId, id);
  }
}
