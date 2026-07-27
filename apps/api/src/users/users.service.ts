import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        accountType: true,
        phone: true,
        city: true,
        firstName: true,
        lastName: true,
        companyName: true,
        sector: true,
        rccmNumber: true,
        representativeFirstName: true,
        representativeLastName: true,
        representativeRole: true,
        verificationStatus: true,
        businessVerified: true,
        createdAt: true,
        updatedAt: true,
        // passwordHash et fichiers volontairement exclus de la réponse API.
      },
    });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }
}
