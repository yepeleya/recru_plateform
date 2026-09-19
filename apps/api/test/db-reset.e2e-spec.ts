// Remise à zéro de la base de test : clés étrangères, connexion unique,
// restauration des contrôles et libération de la connexion même en cas d'erreur.
import { randomUUID } from 'crypto';
import { closeTestPrisma, resetDatabase, testPrisma, truncateTables } from './db';
import { createIdentityDocument, createOffer, createRecruiter, createUser } from './factories';

// Connexions ouvertes sur la base de test courante (celles de ce processus
// comprises). Une connexion fermée peut mettre un instant à quitter la liste.
async function openConnections(): Promise<number> {
  const [row] = await testPrisma().$queryRawUnsafe<{ n: bigint }[]>(
    'SELECT COUNT(*) AS n FROM information_schema.PROCESSLIST WHERE DB = DATABASE()',
  );
  return Number(row.n);
}

async function waitForConnections(expected: number): Promise<number> {
  let current = await openConnections();
  for (let i = 0; i < 20 && current !== expected; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    current = await openConnections();
  }
  return current;
}

describe('resetDatabase', () => {
  afterAll(async () => {
    await closeTestPrisma();
  });

  it('vide toutes les tables, y compris celles liées par des clés étrangères', async () => {
    await resetDatabase();

    const recruiter = await createRecruiter();
    const candidate = await createUser();
    await createIdentityDocument(candidate.id);
    const offer = await createOffer(recruiter.id);
    await testPrisma().application.create({ data: { candidateId: candidate.id, jobOfferId: offer.id } });
    await testPrisma().refreshToken.create({
      data: {
        id: randomUUID(),
        userId: candidate.id,
        sessionId: randomUUID(),
        tokenHash: 'x'.repeat(64),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    await resetDatabase();

    const prisma = testPrisma();
    expect(await prisma.user.count()).toBe(0);
    expect(await prisma.identityDocument.count()).toBe(0);
    expect(await prisma.jobOffer.count()).toBe(0);
    expect(await prisma.application.count()).toBe(0);
    expect(await prisma.refreshToken.count()).toBe(0);
  });

  it('en cas d’erreur : remonte l’erreur, libère la connexion et laisse la base utilisable', async () => {
    await resetDatabase();
    await createUser();
    const before = await openConnections();

    await expect(truncateTables(['users', 'table_absente_du_test'])).rejects.toThrow();

    // La connexion de nettoyage a été fermée malgré l'erreur.
    expect(await waitForConnections(before)).toBe(before);

    // Non atomique (commit implicite de TRUNCATE) : « users » a été vidée avant l'échec.
    expect(await testPrisma().user.count()).toBe(0);

    // Les contrôles de clés étrangères ne sont jamais modifiés globalement,
    // et la connexion du test les voit actifs.
    const [flags] = await testPrisma().$queryRawUnsafe<{ global: bigint; session: bigint }[]>(
      'SELECT @@GLOBAL.foreign_key_checks AS global, @@SESSION.foreign_key_checks AS session',
    );
    expect(Number(flags.global)).toBe(1);
    expect(Number(flags.session)).toBe(1);

    // Un nettoyage suivant fonctionne normalement.
    await expect(resetDatabase()).resolves.toBeUndefined();
  });

  it('un nettoyage réussi ne laisse aucune connexion ouverte derrière lui', async () => {
    await resetDatabase();
    const before = await openConnections();
    await resetDatabase();
    expect(await waitForConnections(before)).toBe(before);
  });

  it('refuse un nom de table invalide avant d’ouvrir la moindre connexion', async () => {
    await expect(truncateTables(['users`; DROP DATABASE bara; --'])).rejects.toThrow(/Nom de table refusé/);
  });
});
