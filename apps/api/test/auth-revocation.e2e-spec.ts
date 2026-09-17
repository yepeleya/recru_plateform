// Déconnexion et révocation, vérifiées sur l'application réelle.
import { INestApplication } from '@nestjs/common';
import { API_PREFIX, createTestApp, decodeJwt, http, login } from './app';
import { closeTestPrisma, resetDatabase, testPrisma } from './db';
import { createUser, TEST_PASSWORD } from './factories';

describe('Déconnexion et révocation de session', () => {
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

  it('la déconnexion depuis le navigateur révoque la session entière', async () => {
    const user = await createUser();
    const session = await login(app, user.email, TEST_PASSWORD);
    await me(session.accessToken).expect(200);

    // Le navigateur n'envoie que le cookie d'accès sur /auth/logout : le cookie
    // de refresh est limité au chemin /auth/refresh.
    await http(app)
      .post(`${API_PREFIX}/auth/logout`)
      .set('Cookie', `bara_access=${session.accessToken}`)
      .expect(201);

    await me(session.accessToken).expect(401);
    await http(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set('Cookie', `bara_refresh=${session.refreshToken}`)
      .expect(401);

    const rows = await testPrisma().refreshToken.findMany({ where: { userId: user.id } });
    expect(rows.every((r) => r.revokedAt !== null)).toBe(true);
  });

  it('la déconnexion par le seul refresh token révoque aussi la session', async () => {
    const user = await createUser();
    const session = await login(app, user.email, TEST_PASSWORD);

    await http(app)
      .post(`${API_PREFIX}/auth/logout`)
      .set('Cookie', `bara_refresh=${session.refreshToken}`)
      .expect(201);

    await me(session.accessToken).expect(401);
  });

  it('déconnecter une session laisse les autres sessions du compte actives', async () => {
    const user = await createUser();
    const first = await login(app, user.email, TEST_PASSWORD);
    const second = await login(app, user.email, TEST_PASSWORD);
    expect(decodeJwt<{ sid: string }>(first.accessToken).sid).not.toBe(
      decodeJwt<{ sid: string }>(second.accessToken).sid,
    );

    await http(app)
      .post(`${API_PREFIX}/auth/logout`)
      .set('Cookie', `bara_access=${first.accessToken}`)
      .expect(201);

    await me(first.accessToken).expect(401);
    await me(second.accessToken).expect(200);
  });

  it('un compte supprimé perd immédiatement ses sessions', async () => {
    const user = await createUser();
    const session = await login(app, user.email, TEST_PASSWORD);
    await me(session.accessToken).expect(200);

    await testPrisma().user.delete({ where: { id: user.id } });

    await me(session.accessToken).expect(401);
    await http(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set('Cookie', `bara_refresh=${session.refreshToken}`)
      .expect(401);
    expect(await testPrisma().refreshToken.count({ where: { userId: user.id } })).toBe(0);
  });
});
