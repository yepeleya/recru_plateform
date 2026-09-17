// La limitation de débit est un vrai garde-fou : on vérifie qu'elle s'applique,
// sans jamais la neutraliser ailleurs. Fichier séparé : chaque fichier de test
// construit sa propre application, donc son propre compteur.
import { INestApplication } from '@nestjs/common';
import { API_PREFIX, createTestApp, http } from './app';
import { closeTestPrisma, resetDatabase } from './db';

describe('Limitation de débit sur la connexion', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
    await resetDatabase();
  });

  afterAll(async () => {
    await app.close();
    await closeTestPrisma();
  });

  it('bloque en 429 au-delà de 10 tentatives de connexion par minute', async () => {
    const attempt = () =>
      http(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ email: 'inconnu@example.test', password: 'MauvaisMotDePasse1' });

    for (let i = 0; i < 10; i += 1) {
      await attempt().expect(401);
    }
    await attempt().expect(429);
  });
});
