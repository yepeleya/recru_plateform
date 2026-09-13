import { Controller, Get, INestApplication, Req, UseGuards } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, load: [() => ({ JWT_SECRET: TEST_SECRET })] }),
        PassportModule,
        JwtModule.register({ secret: TEST_SECRET }),
      ],
      controllers: [ProtectedController],
      providers: [JwtStrategy],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  const claims = { sub: 'user-1', email: 'sonde@example.com', role: 'USER' };
  const accessToken = () => jwt.sign({ ...claims, typ: 'a' }, { expiresIn: '15m' });
  const refreshToken = () => jwt.sign({ ...claims, typ: 'r', jti: 'jti-1' }, { expiresIn: '7d' });

  it('refuse une requête sans jeton', async () => {
    await request(app.getHttpServer()).get('/protected').expect(401);
  });

  it('accepte un jeton d’accès en en-tête Bearer', async () => {
    const res = await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${accessToken()}`)
      .expect(200);
    expect(res.body).toEqual({ userId: 'user-1', email: 'sonde@example.com', role: 'USER' });
  });

  it('accepte un jeton d’accès dans le cookie bara_access', async () => {
    await request(app.getHttpServer())
      .get('/protected')
      .set('Cookie', `bara_access=${accessToken()}`)
      .expect(200);
  });

  it('refuse un jeton de rafraîchissement présenté en Bearer (cas A)', async () => {
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${refreshToken()}`)
      .expect(401);
  });

  it('refuse un jeton de rafraîchissement placé dans le cookie d’accès (cas A)', async () => {
    await request(app.getHttpServer())
      .get('/protected')
      .set('Cookie', `bara_access=${refreshToken()}`)
      .expect(401);
  });

  it('refuse un jeton sans type', async () => {
    const untyped = jwt.sign(claims, { expiresIn: '15m' });
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${untyped}`)
      .expect(401);
  });

  it('refuse un jeton d’un type inconnu', async () => {
    const other = jwt.sign({ ...claims, typ: 'x' }, { expiresIn: '15m' });
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${other}`)
      .expect(401);
  });

  it('refuse un jeton d’accès signé avec un autre secret', async () => {
    const forged = jwt.sign({ ...claims, typ: 'a' }, { secret: `${TEST_SECRET}-autre`, expiresIn: '15m' });
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${forged}`)
      .expect(401);
  });

  it('refuse un jeton d’accès expiré', async () => {
    const expired = jwt.sign({ ...claims, typ: 'a', exp: Math.floor(Date.now() / 1000) - 60 });
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${expired}`)
      .expect(401);
  });
});

describe('JwtStrategy — configuration', () => {
  it('refuse de s’initialiser sans JWT_SECRET (aucun secret de repli)', () => {
    const config = new ConfigService({});
    expect(() => new JwtStrategy(config)).toThrow();
  });
});
