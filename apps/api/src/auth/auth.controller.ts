import { Body, Controller, Post, Req, Res, UnauthorizedException, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { RegisterFiles } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const COOKIE_ACCESS = 'bara_access';
const COOKIE_REFRESH = 'bara_refresh';
// Le cookie de refresh n'est envoyé que sur ce chemin précis, jamais sur le
// reste de l'API. Doit rester synchronisé avec le préfixe global (api/v1).
const REFRESH_PATH = '/api/v1/auth/refresh';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProd = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: 'strict' as const };
    res.cookie(COOKIE_ACCESS, tokens.accessToken, { ...base, path: '/', maxAge: 15 * 60 * 1000 });
    res.cookie(COOKIE_REFRESH, tokens.refreshToken, {
      ...base,
      path: REFRESH_PATH,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearCookies(res: Response) {
    res.clearCookie(COOKIE_ACCESS, { path: '/' });
    res.clearCookie(COOKIE_REFRESH, { path: REFRESH_PATH });
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'idFrontFile', maxCount: 1 },
      { name: 'idBackFile', maxCount: 1 },
      { name: 'rccmFile', maxCount: 1 },
    ]),
  )
  async register(
    @Body() dto: RegisterDto,
    @UploadedFiles() files: RegisterFiles,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(dto, files ?? {});
    this.setCookies(res, tokens);
    return { ok: true };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    this.setCookies(res, tokens);
    return { ok: true };
  }

  // Émet un nouvel access token (15 min) à partir du cookie de refresh longue durée.
  // Doit lever une exception (pas retourner {ok:false}) en cas d'échec : NestJS
  // renvoie 201 par défaut sur un POST, un objet renvoyé tel quel ressemblerait
  // à un succès pour un appelant qui ne vérifie que res.ok.
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req.cookies as Record<string, string> | undefined)?.[COOKIE_REFRESH];
    if (!token) {
      this.clearCookies(res);
      throw new UnauthorizedException();
    }
    try {
      const tokens = await this.authService.refreshTokens(token);
      this.setCookies(res, tokens);
      return { ok: true };
    } catch {
      this.clearCookies(res);
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req.cookies as Record<string, string> | undefined)?.[COOKIE_REFRESH];
    await this.authService.revokeRefreshToken(token);
    this.clearCookies(res);
    return { ok: true };
  }
}
