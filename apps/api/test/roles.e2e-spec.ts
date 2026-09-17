// Contrôle des rôles et des droits : le rôle vient de la base, jamais du jeton,
// et aucun jeton ne permet une élévation de privilèges.
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { API_PREFIX, createTestApp, decodeJwt, http, login } from './app';
import { closeTestPrisma, resetDatabase } from './db';
import {
  TEST_PASSWORD,
  createAdmin,
  createIdentityDocument,
  createRecruiter,
  createUser,
} from './factories';

describe('Rôles, propriété et élévation de privilèges', () => {
  let app: INestApplication;
  let jwt: JwtService;

  beforeAll(async () => {
    app = await createTestApp();
    jwt = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
    await closeTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  const identityFile = (fileName: string, token: string) =>
    http(app).get(`${API_PREFIX}/uploads/identity/${fileName}`).set('Authorization', `Bearer ${token}`);

  it('le propriétaire accède à sa pièce d’identité, un tiers non', async () => {
    const owner = await createUser();
    const document = await createIdentityDocument(owner.id);
    const stranger = await createUser();

    const ownerSession = await login(app, owner.email, TEST_PASSWORD);
    const strangerSession = await login(app, stranger.email, TEST_PASSWORD);

    await identityFile(document.fileName, ownerSession.accessToken).expect(200);
    await identityFile(document.fileName, strangerSession.accessToken).expect(403);
  });

  it('un administrateur réel accède au document, et le rôle vient de la base', async () => {
    const owner = await createUser();
    const document = await createIdentityDocument(owner.id);
    const admin = await createAdmin();

    const adminSession = await login(app, admin.email, TEST_PASSWORD);

    const me = await http(app)
      .get(`${API_PREFIX}/users/me`)
      .set('Authorization', `Bearer ${adminSession.accessToken}`)
      .expect(200);
    expect(me.body.role).toBe('ADMIN');

    await identityFile(document.fileName, adminSession.accessToken).expect(200);
  });

  it('un jeton signé annonçant ADMIN ne donne aucun droit d’administrateur', async () => {
    const owner = await createUser();
    const document = await createIdentityDocument(owner.id);
    const attacker = await createUser();
    const session = await login(app, attacker.email, TEST_PASSWORD);

    // Jeton parfaitement signé, session réelle de l'attaquant, mais rôle gonflé.
    const forged = jwt.sign(
      {
        sub: attacker.id,
        email: attacker.email,
        role: 'ADMIN',
        typ: 'a',
        sid: decodeJwt<{ sid: string }>(session.accessToken).sid,
      },
      { expiresIn: '15m' },
    );

    const me = await http(app)
      .get(`${API_PREFIX}/users/me`)
      .set('Authorization', `Bearer ${forged}`)
      .expect(200);
    expect(me.body.role).toBe('USER');

    await identityFile(document.fileName, forged).expect(403);
  });

  it('un candidat ne peut pas publier une offre, un recruteur le peut', async () => {
    const candidate = await createUser({ accountType: 'candidat' });
    const recruiter = await createRecruiter();

    const candidateSession = await login(app, candidate.email, TEST_PASSWORD);
    const recruiterSession = await login(app, recruiter.email, TEST_PASSWORD);

    const offer = {
      title: 'Mission de test',
      description: 'Description de test.',
      metierSlug: 'graphiste',
      type: 'mission-ponctuelle',
      city: 'Abidjan',
    };

    await http(app)
      .post(`${API_PREFIX}/job-offers`)
      .set('Authorization', `Bearer ${candidateSession.accessToken}`)
      .send(offer)
      .expect(403);

    const created = await http(app)
      .post(`${API_PREFIX}/job-offers`)
      .set('Authorization', `Bearer ${recruiterSession.accessToken}`)
      .send(offer)
      .expect(201);
    // Une offre naît toujours en brouillon, jamais publiée par le client.
    expect(created.body.offer.status).toBe('draft');
  });
});
