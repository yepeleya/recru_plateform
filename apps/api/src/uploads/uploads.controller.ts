import { Controller, ForbiddenException, Get, NotFoundException, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { resolve } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

// Sert les pièces d'identité et RCCM — jamais via un dossier statique public.
// Seul le propriétaire du document ou un administrateur peut y accéder.
@Controller('uploads/identity')
export class UploadsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(':filename')
  async getIdentityFile(
    @Param('filename') filename: string,
    @Req() req: Request & { user: { userId: string; role: string } },
    @Res() res: Response,
  ) {
    const document = await this.prisma.identityDocument.findFirst({
      where: { OR: [{ frontFileKey: filename }, { backFileKey: filename }] },
    });

    if (!document) {
      throw new NotFoundException();
    }

    const isOwner = document.userId === req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException();
    }

    const uploadDir = this.config.get<string>('UPLOAD_DIR') ?? './uploads/private';
    const filePath = resolve(process.cwd(), uploadDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException();
    }

    res.sendFile(filePath);
  }
}
