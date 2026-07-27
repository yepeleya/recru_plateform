import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterFiles {
  idFrontFile?: Express.Multer.File[];
  idBackFile?: Express.Multer.File[];
  rccmFile?: Express.Multer.File[];
}

interface RefreshPayload {
  sub: string;
  email: string;
  role: string;
  typ: string;
  jti: string;
}

// Types de pièce nécessitant un recto ET un verso (permis, CNI physique).
const DOCUMENT_TYPES_REQUIRING_BACK = new Set(['cni', 'permis-conduire']);

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, files: RegisterFiles): Promise<TokenPair> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email.');
    }

    // Revalidation côté serveur : le frontend bloque déjà l'envoi sans pièce
    // recto (et verso pour CNI/permis), mais on ne fait jamais confiance au
    // seul client pour une donnée aussi sensible que l'identité.
    const frontFile = files.idFrontFile?.[0];
    if (!frontFile) {
      throw new BadRequestException("La photo recto de la pièce d'identité est obligatoire.");
    }
    const backFile = files.idBackFile?.[0];
    if (DOCUMENT_TYPES_REQUIRING_BACK.has(dto.idDocumentType) && !backFile) {
      throw new BadRequestException('La photo verso est obligatoire pour ce type de document.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const isBusiness = dto.accountType === 'recruteur-entreprise';

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        accountType: dto.accountType,
        phone: dto.phone,
        city: dto.city,
        firstName: isBusiness ? undefined : dto.firstName,
        lastName: isBusiness ? undefined : dto.lastName,
        companyName: isBusiness ? dto.companyName : undefined,
        sector: isBusiness ? dto.sector : undefined,
        rccmNumber: isBusiness ? dto.rccmNumber : undefined,
        rccmFileKey: isBusiness ? files.rccmFile?.[0]?.filename : undefined,
        representativeFirstName: isBusiness ? dto.representativeFirstName : undefined,
        representativeLastName: isBusiness ? dto.representativeLastName : undefined,
        representativeRole: isBusiness ? dto.representativeRole : undefined,
        identityDocument: {
          create: {
            type: dto.idDocumentType,
            number: dto.idDocumentNumber,
            frontFileKey: frontFile.filename,
            backFileKey: backFile?.filename,
          },
        },
      },
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refreshTokens(rawToken: string): Promise<TokenPair> {
    let payload: RefreshPayload;
    try {
      payload = this.jwtService.verify(rawToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      }) as RefreshPayload;
    } catch {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter.');
    }

    if (payload.typ !== 'r' || !payload.jti) {
      throw new UnauthorizedException('Jeton de rafraîchissement invalide.');
    }

    const stored = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    // Le token doit exister, ne pas être révoqué, ne pas être expiré, et son
    // hash doit correspondre exactement au token présenté (défense en profondeur
    // contre un jti forgé ou un token de la base réutilisé après fuite).
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt.getTime() < Date.now() ||
      stored.tokenHash !== hashToken(rawToken)
    ) {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter.');
    }

    const user = await this.usersService.findByEmail(payload.email);
    if (!user || user.id !== payload.sub) {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter.');
    }

    // Rotation : l'ancien refresh token est révoqué, un nouveau est émis. Un
    // token déjà utilisé ne peut donc pas être rejoué.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  // Révoque le refresh token présenté (logout). Best-effort : un token déjà
  // invalide ne doit pas faire échouer la déconnexion côté client.
  async revokeRefreshToken(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    try {
      const payload = this.jwtService.verify(rawToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      }) as RefreshPayload;
      if (payload.jti) {
        await this.prisma.refreshToken.updateMany({
          where: { id: payload.jti, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      // Token illisible/expiré : rien à révoquer, on ignore silencieusement.
    }
  }

  private async issueTokens(userId: string, email: string, role: string): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, role, typ: 'a' },
      { expiresIn: '15m' },
    );

    // jti = identifiant de la ligne RefreshToken, embarqué dans le JWT refresh.
    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: userId, email, role, typ: 'r', jti },
      { expiresIn: '7d' },
    );

    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }
}
