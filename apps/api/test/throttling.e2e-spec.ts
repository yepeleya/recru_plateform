// La limitation de débit est un vrai garde-fou : on vérifie qu'elle s'applique,
// sans jamais la neutraliser ailleurs.
//
// Déterminisme : le compteur est gardé en mémoire par l'instance de
// l'application. Chaque fichier de test construit la sienne dans beforeAll, donc
// part d'un compteur vide ; aucun compteur n'est partagé entre fichiers (vérifié
// ci-dessous). Les 11 requêtes tiennent largement dans la fenêtre de 60 s.
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

  const attempt = (target: INestApplication) =>
    http(target)
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: 'inconnu@example.test', password: 'MauvaisMotDePasse1' });

  it('bloque en 429 au-delà de 10 tentatives de connexion par minute', async () => {
    for (let i = 0; i < 10; i += 1) {
      await attempt(app).expect(401);
    }
    await attempt(app).expect(429);
  });

  it('une autre instance de l’application repart d’un compteur vide', async () => {
    // Même fenêtre de temps, même IP : si le compteur était partagé, ce serait 429.
    const other = await createTestApp();
    try {
      await attempt(other).expect(401);
    } finally {
      await other.close();
    }
  });
});
