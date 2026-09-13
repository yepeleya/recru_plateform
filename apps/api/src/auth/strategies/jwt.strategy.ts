import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  typ: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
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

  async validate(payload: JwtPayload) {
    // Seul un jeton d'accès (typ 'a') ouvre une route protégée. Le jeton de
    // rafraîchissement (typ 'r', 7 jours) est signé avec le même secret : sans ce
    // contrôle il passerait ici et contournerait la durée courte de l'accès.
    // Ce contrôle ne rend PAS la déconnexion immédiate : un jeton d'accès reste
    // valide jusqu'à son expiration (15 min).
    if (payload?.typ !== 'a') {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
