import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  typ: string;
  // Identifiant de la session de connexion (RefreshToken.sessionId).
  sid?: string;
}

// Identité posée sur req.user pour chaque requête authentifiée.
export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      // Préfère le cookie HttpOnly ; retombe sur le header Bearer pour les tests API.
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies as Record<string, string> | undefined)?.['bara_access'] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      // Aucun secret de repli : sans JWT_SECRET, l'API refuse de démarrer.
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    // Seul un jeton d'accès (typ 'a') rattaché à une session ouvre une route
    // protégée. Le jeton de rafraîchissement (typ 'r') est signé avec le même
    // secret : il est refusé ici, sans même interroger la base.
    if (payload?.typ !== 'a' || !payload.sid || !payload.sub) {
      throw new UnauthorizedException();
    }

    // La signature ne suffit pas : la session doit exister, appartenir à ce
    // compte, ne pas être révoquée (logout) ni expirée. Un compte supprimé n'a
    // plus de session (cascade). Le rôle est relu en base, jamais pris du jeton.
    const session = await this.prisma.refreshToken.findFirst({
      where: {
        sessionId: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        // Point d'extension modération (hors phase) : quand un statut de compte
        // existera, le filtrer ici, par exemple `user: { suspendedAt: null }`.
      },
      select: { user: { select: { id: true, email: true, role: true } } },
    });
    if (!session) {
      throw new UnauthorizedException();
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: payload.sid,
    };
  }
}
