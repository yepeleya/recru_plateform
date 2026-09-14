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

interface AccessPayload {
  sub: string;
  typ: string;
  sid?: string;
}

interface SessionRef {
  sessionId: string;
  userId: string;
}

// Types de pièce nécessitant un recto ET un verso (permis, CNI physique).
const DOCUMENT_TYPES_REQUIRING_BACK = new Set(['cni', 'permis-conduire']);

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const SESSION_EXPIRED = 'Session expirée, veuillez vous reconnecter.';

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

    return this.openSession(user.id, user.email, user.role);
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

    return this.openSession(user.id, user.email, user.role);
  }

  // Rotation : le refresh token présenté est révoqué et remplacé par un nouveau,
  // dans la MÊME session. Aucune nouvelle session n'est créée.
  async refreshTokens(rawToken: string): Promise<TokenPair> {
    let payload: RefreshPayload;
    try {
      payload = this.jwtService.verify<RefreshPayload>(rawToken, { secret: this.jwtSecret() });
    } catch {
      throw new UnauthorizedException(SESSION_EXPIRED);
    }

    if (payload.typ !== 'r' || !payload.jti) {
      throw new UnauthorizedException('Jeton de rafraîchissement invalide.');
    }

    const stored = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    // Le token doit exister, appartenir au compte du jeton, ne pas être révoqué,
    // ne pas être expiré, et son hash doit correspondre exactement au token
    // présenté (défense en profondeur contre un jti forgé ou un token de la base
    // réutilisé après fuite).
    if (
      !stored ||
      stored.userId !== payload.sub ||
      stored.revokedAt ||
      stored.expiresAt.getTime() < Date.now() ||
      stored.tokenHash !== hashToken(rawToken)
    ) {
      throw new UnauthorizedException(SESSION_EXPIRED);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException(SESSION_EXPIRED);
    }

    const signed = this.signTokens(user.id, user.email, user.role, stored.sessionId);

    // Révocation conditionnelle + émission dans une seule transaction :
    //  - deux rafraîchissements simultanés du même token : un seul obtient count = 1 ;
    //  - la session n'est jamais observée sans token actif entre les deux écritures.
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.refreshToken.updateMany({
        where: { id: stored.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (count !== 1) {
        throw new UnauthorizedException(SESSION_EXPIRED);
      }
      await tx.refreshToken.create({
        data: {
          id: signed.jti,
          userId: user.id,
          sessionId: stored.sessionId,
          tokenHash: hashToken(signed.refreshToken),
          expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        },
      });
    });

    return { accessToken: signed.accessToken, refreshToken: signed.refreshToken };
  }

  // Logout : révoque TOUTE la session (tous ses refresh tokens, rotations
  // comprises), pas un token isolé. Les access tokens de la session deviennent
  // inutilisables immédiatement, puisque chaque requête vérifie la session.
  //
  // La session est identifiée par le jeton d'accès (`sid`) — c'est le seul que le
  // navigateur envoie sur /auth/logout, le cookie de refresh étant limité à
  // /auth/refresh — ou, à défaut, par le refresh token. Expiration ignorée pour
  // cette seule identification : révoquer une session n'ouvre aucun accès.
  // Best-effort : un jeton illisible ne fait pas échouer la déconnexion.
  async revokeSession(tokens: { accessToken?: string; refreshToken?: string }): Promise<void> {
    const refs = [this.sessionFromAccess(tokens.accessToken), await this.sessionFromRefresh(tokens.refreshToken)];
    const seen = new Set<string>();
    for (const ref of refs) {
      if (!ref || seen.has(ref.sessionId)) continue;
      seen.add(ref.sessionId);
      await this.prisma.refreshToken.updateMany({
        where: { sessionId: ref.sessionId, userId: ref.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  private sessionFromAccess(token: string | undefined): SessionRef | null {
    if (!token) return null;
    try {
      const payload = this.jwtService.verify<AccessPayload>(token, {
        secret: this.jwtSecret(),
        ignoreExpiration: true,
      });
      return payload.typ === 'a' && payload.sid && payload.sub
        ? { sessionId: payload.sid, userId: payload.sub }
        : null;
    } catch {
      return null;
    }
  }

  private async sessionFromRefresh(token: string | undefined): Promise<SessionRef | null> {
    if (!token) return null;
    try {
      const payload = this.jwtService.verify<RefreshPayload>(token, {
        secret: this.jwtSecret(),
        ignoreExpiration: true,
      });
      if (payload.typ !== 'r' || !payload.jti) return null;
      const row = await this.prisma.refreshToken.findUnique({
        where: { id: payload.jti },
        select: { sessionId: true, userId: true },
      });
      return row && row.userId === payload.sub ? row : null;
    } catch {
      return null;
    }
  }

  // Nouvelle connexion (login, inscription) = nouvelle session.
  private async openSession(userId: string, email: string, role: string): Promise<TokenPair> {
    const sessionId = randomUUID();
    const signed = this.signTokens(userId, email, role, sessionId);
    await this.prisma.refreshToken.create({
      data: {
        id: signed.jti,
        userId,
        sessionId,
        tokenHash: hashToken(signed.refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });
    return { accessToken: signed.accessToken, refreshToken: signed.refreshToken };
  }

  private signTokens(userId: string, email: string, role: string, sessionId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, role, typ: 'a', sid: sessionId },
      { expiresIn: '15m' },
    );

    // jti = identifiant de la ligne RefreshToken, embarqué dans le JWT refresh.
    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: userId, email, role, typ: 'r', jti },
      { expiresIn: '7d' },
    );

    return { jti, accessToken, refreshToken };
  }

  private jwtSecret(): string {
    return this.config.getOrThrow<string>('JWT_SECRET');
  }
}
