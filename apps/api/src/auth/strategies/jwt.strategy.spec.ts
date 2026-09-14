import { Controller, Get, INestApplication, Req, UseGuards } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';

// Secret de test uniquement — jamais utilisé hors de ce fichier.
const TEST_SECRET = 'test-secret-for-jwt-strategy-spec-0123456789';

@Controller('protected')
@UseGuards(JwtAuthGuard)
class ProtectedController {
  @Get()
  me(@Req() req: { user: unknown }) {
    return req.user;
  }
}

describe('JwtStrategy — routes protégées', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const findFirst = jest.fn();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, load: [() => ({ JWT_SECRET: TEST_SECRET })] }),
        PassportModule,
        JwtModule.register({ secret: TEST_SECRET }),
      ],
      controllers: [ProtectedController],
      providers: [JwtStrategy, { provide: PrismaService, useValue: { refreshToken: { findFirst } } }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    findFirst.mockReset();
    // Par défaut : session active, rôle en base USER.
    findFirst.mockResolvedValue({ user: { id: 'user-1', email: 'sonde@example.com', role: 'USER' } });
  });

  const claims = { sub: 'user-1', email: 'sonde@example.com', role: 'USER' };
  const accessToken = (extra: Record<string, unknown> = {}) =>
    jwt.sign({ ...claims, typ: 'a', sid: 'session-1', ...extra }, { expiresIn: '15m' });
  const refreshToken = () => jwt.sign({ ...claims, typ: 'r', jti: 'jti-1' }, { expiresIn: '7d' });

  it('refuse une requête sans jeton', async () => {
    await request(app.getHttpServer()).get('/protected').expect(401);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('accepte un jeton d’accès dont la session est active (Bearer)', async () => {
    const res = await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${accessToken()}`)
      .expect(200);
    expect(res.body).toEqual({
      userId: 'user-1',
      email: 'sonde@example.com',
      role: 'USER',
      sessionId: 'session-1',
    });
  });

  it('vérifie la session en base : même session, même compte, non révoquée, non expirée', async () => {
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${accessToken()}`)
      .expect(200);
    const where = findFirst.mock.calls[0][0].where;
    expect(where.sessionId).toBe('session-1');
    expect(where.userId).toBe('user-1');
    expect(where.revokedAt).toBeNull();
    expect(where.expiresAt.gt).toBeInstanceOf(Date);
  });

  it('accepte un jeton d’accès dans le cookie bara_access', async () => {
    await request(app.getHttpServer())
      .get('/protected')
      .set('Cookie', `bara_access=${accessToken()}`)
      .expect(200);
  });

  it('refuse un jeton d’accès dont la session est révoquée ou supprimée (cas B et C)', async () => {
    findFirst.mockResolvedValue(null);
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${accessToken()}`)
      .expect(401);
  });

  it('prend le rôle en base, jamais celui du jeton', async () => {
    const res = await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${accessToken({ role: 'ADMIN' })}`)
      .expect(200);
    expect(res.body.role).toBe('USER');
  });

  it('refuse un jeton d’accès sans session (sid absent)', async () => {
    const noSid = jwt.sign({ ...claims, typ: 'a' }, { expiresIn: '15m' });
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${noSid}`)
      .expect(401);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('refuse un jeton de rafraîchissement présenté en Bearer (cas A)', async () => {
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${refreshToken()}`)
      .expect(401);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('refuse un jeton de rafraîchissement placé dans le cookie d’accès (cas A)', async () => {
    await request(app.getHttpServer())
      .get('/protected')
      .set('Cookie', `bara_access=${refreshToken()}`)
      .expect(401);
  });

  it('refuse un jeton sans type', async () => {
    const untyped = jwt.sign({ ...claims, sid: 'session-1' }, { expiresIn: '15m' });
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${untyped}`)
      .expect(401);
  });

  it('refuse un jeton d’accès signé avec un autre secret', async () => {
    const forged = jwt.sign(
      { ...claims, typ: 'a', sid: 'session-1' },
      { secret: `${TEST_SECRET}-autre`, expiresIn: '15m' },
    );
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${forged}`)
      .expect(401);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('refuse un jeton d’accès expiré', async () => {
    const expired = jwt.sign({
      ...claims,
      typ: 'a',
      sid: 'session-1',
      exp: Math.floor(Date.now() / 1000) - 60,
    });
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${expired}`)
      .expect(401);
  });
});

describe('JwtStrategy — configuration', () => {
  it('refuse de s’initialiser sans JWT_SECRET (aucun secret de repli)', () => {
    // Le client Prisma charge apps/api/.env dans process.env à l'import : on retire
    // la variable le temps du test pour vérifier réellement l'absence de secret.
    const saved = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      const config = new ConfigService({});
      expect(() => new JwtStrategy(config, {} as PrismaService)).toThrow();
    } finally {
      if (saved !== undefined) process.env.JWT_SECRET = saved;
    }
  });
});
