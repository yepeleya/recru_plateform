// Tests HTTP sur l'application NestJS réelle : mêmes guards, même stratégie JWT,
// même base (de test). Chaque test crée ses propres données.
import { INestApplication } from '@nestjs/common';
import { API_PREFIX, createTestApp, decodeJwt, http, login } from './app';
import { closeTestPrisma, resetDatabase, testPrisma } from './db';
import { createUser, TEST_PASSWORD } from './factories';

describe('Sessions — jeton d’accès, session en base, rotation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await closeTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  const me = (token: string) =>
    http(app).get(`${API_PREFIX}/users/me`).set('Authorization', `Bearer ${token}`);

  it('refuse une requête sans jeton', async () => {
    await http(app).get(`${API_PREFIX}/users/me`).expect(401);
  });

  it('ouvre une session à la connexion et accepte son jeton d’accès', async () => {
    const user = await createUser();
    const session = await login(app, user.email, TEST_PASSWORD);

    const res = await me(session.accessToken).expect(200);
    expect(res.body.email).toBe(user.email);

    const sid = decodeJwt<{ sid?: string }>(session.accessToken).sid;
    const rows = await testPrisma().refreshToken.findMany({ where: { userId: user.id } });
    expect(rows).toHaveLength(1);
    expect(rows[0].sessionId).toBe(sid);
    expect(rows[0].revokedAt).toBeNull();
  });

  it('refuse un refresh token présenté comme jeton d’accès', async () => {
    const user = await createUser();
    const session = await login(app, user.email, TEST_PASSWORD);

    await me(session.refreshToken).expect(401);
  });

  it('refuse un jeton d’accès dont la session n’existe pas en base', async () => {
    const user = await createUser();
    const session = await login(app, user.email, TEST_PASSWORD);

    // La session disparaît (cas d'une purge ou d'une session inconnue).
    await testPrisma().refreshToken.deleteMany({ where: { userId: user.id } });

    await me(session.accessToken).expect(401);
  });

  it('la rotation garde la même session et invalide l’ancien refresh token', async () => {
    const user = await createUser();
    const first = await login(app, user.email, TEST_PASSWORD);

    const rotated = await http(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set('Cookie', `bara_refresh=${first.refreshToken}`)
      .expect(201);

    const cookies = ([] as string[]).concat(rotated.headers['set-cookie'] ?? []);
    const newAccess = cookies
      .map((c) => c.split(';')[0])
      .find((c) => c.startsWith('bara_access='))!
      .slice('bara_access='.length);

    expect(decodeJwt<{ sid: string }>(newAccess).sid).toBe(
      decodeJwt<{ sid: string }>(first.accessToken).sid,
    );

    const rows = await testPrisma().refreshToken.findMany({ where: { userId: user.id } });
    expect(rows).toHaveLength(2);
    expect(rows.filter((r) => r.revokedAt === null)).toHaveLength(1);
    expect(new Set(rows.map((r) => r.sessionId)).size).toBe(1);

    // Le nouveau jeton d'accès fonctionne ; l'ancien refresh token est mort.
    await me(newAccess).expect(200);
    await http(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set('Cookie', `bara_refresh=${first.refreshToken}`)
      .expect(401);
  });
});
