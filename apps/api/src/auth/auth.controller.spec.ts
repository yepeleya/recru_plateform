import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController — logout', () => {
  let app: INestApplication;
  const revokeSession = jest.fn();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: { revokeSession } }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    revokeSession.mockReset();
    revokeSession.mockResolvedValue(undefined);
  });

  it('identifie la session par le cookie d’accès, le seul envoyé par le navigateur', async () => {
    await request(app.getHttpServer()).post('/auth/logout').set('Cookie', 'bara_access=acc').expect(201);
    expect(revokeSession).toHaveBeenCalledWith({ accessToken: 'acc', refreshToken: undefined });
  });

  it('accepte un jeton d’accès en Bearer (client API)', async () => {
    await request(app.getHttpServer()).post('/auth/logout').set('Authorization', 'Bearer acc').expect(201);
    expect(revokeSession).toHaveBeenCalledWith({ accessToken: 'acc', refreshToken: undefined });
  });

  it('transmet aussi le refresh token s’il est présent', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', 'bara_access=acc; bara_refresh=ref')
      .expect(201);
    expect(revokeSession).toHaveBeenCalledWith({ accessToken: 'acc', refreshToken: 'ref' });
  });

  it('efface les deux cookies', async () => {
    const res = await request(app.getHttpServer()).post('/auth/logout').set('Cookie', 'bara_access=acc').expect(201);
    const setCookie = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
    expect(setCookie.some((c) => c.startsWith('bara_access=;'))).toBe(true);
    expect(setCookie.some((c) => c.startsWith('bara_refresh=;') && c.includes('Path=/api/v1/auth/refresh'))).toBe(true);
  });
});
