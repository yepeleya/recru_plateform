import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvsService } from './cvs.service';
import { SaveCvDto } from './dto/save-cv.dto';

type AuthReq = { user: { userId: string; role: string } };

@Controller('cvs')
@UseGuards(JwtAuthGuard)
export class CvsController {
  constructor(private readonly cvs: CvsService) {}

  // Le CV du candidat connecté. Toujours enveloppé dans `{ cv }` : l'absence de CV
  // est un état valide (`{ cv: null }`) — l'inscription n'exige jamais de CV, et un
  // corps vide piégerait le frontend. Ce contrat `{ cv }` est partagé par toutes
  // les réponses CV pour rester homogène côté client.
  @Get('me')
  async getMine(@Req() req: AuthReq) {
    return { cv: await this.cvs.getMine(req.user.userId) };
  }

  // Consulter un CV par id — propriétaire, admin, ou recruteur autorisé (règle 10).
  // Déclaré après `me` pour ne pas capturer la route littérale /cvs/me.
  @Get(':id')
  async getOne(@Req() req: AuthReq, @Param('id') id: string) {
    return { cv: await this.cvs.getById(req.user.userId, req.user.role, id) };
  }

  // Créer / remplacer le CV généré sur Bara.
  @Post()
  async save(@Req() req: AuthReq, @Body() dto: SaveCvDto) {
    return { cv: await this.cvs.saveGenerated(req.user.userId, dto) };
  }

  @Patch(':id')
  async update(@Req() req: AuthReq, @Param('id') id: string, @Body() dto: SaveCvDto) {
    return { cv: await this.cvs.updateGenerated(req.user.userId, id, dto) };
  }

  @Delete(':id')
  remove(@Req() req: AuthReq, @Param('id') id: string) {
    return this.cvs.remove(req.user.userId, id);
  }

  // Importer / remplacer un CV PDF existant.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @Req() req: AuthReq,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
  ) {
    return { cv: await this.cvs.importCv(req.user.userId, file, title) };
  }

  // Télécharge le fichier d'un CV importé — jamais via un dossier public. Le
  // contrôle d'accès (propriétaire / admin) est fait dans le service.
  @Get(':id/file')
  async file(@Req() req: AuthReq, @Param('id') id: string, @Res() res: Response) {
    const { filePath, fileName } = await this.cvs.getFileForDownload(
      req.user.userId,
      req.user.role,
      id,
    );
    res.sendFile(filePath, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  }
}
