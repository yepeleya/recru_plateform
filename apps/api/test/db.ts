// Accès à la base de TEST et remise à zéro entre les tests.
// Chaque point d'entrée revérifie que la base ciblée est bien une base « _test ».
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { API_ROOT, assertTestDatabase, TEST_UPLOAD_DIR } from './test-env';

let client: PrismaClient | undefined;

export function testPrisma(): PrismaClient {
  if (!client) {
    assertTestDatabase(process.env.DATABASE_URL);
    client = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  }
  return client;
}

const TABLE_NAME = /^[A-Za-z0-9_]+$/;

/** URL de la base de test, contrainte à une seule connexion. */
function singleConnectionUrl(): string {
  const raw = process.env.DATABASE_URL;
  assertTestDatabase(raw);
  const url = new URL(raw!);
  url.searchParams.set('connection_limit', '1');
  return url.toString();
}

/**
 * Vide les tables données sur UNE connexion dédiée, ouverte pour l'occasion et
 * toujours fermée ensuite.
 *
 * Garanties :
 *  - un client Prisma limité à une connexion (`connection_limit=1`) exécute la
 *    vérification de la base, SET FOREIGN_KEY_CHECKS = 0 et tous les TRUNCATE :
 *    le réglage, propre à une session MySQL, s'applique donc bien aux TRUNCATE ;
 *  - FOREIGN_KEY_CHECKS = 1 est restauré dans un `finally` ;
 *  - la connexion est fermée dans un `finally`, même en cas d'erreur : aucune
 *    session aux contrôles désactivés ne retourne dans un pool.
 *
 * Ce que ce n'est PAS : une opération atomique. Sous MySQL, chaque TRUNCATE
 * provoque un commit implicite. Si une table échoue, celles déjà vidées le
 * restent ; l'erreur est remontée et le test échoue.
 */
export async function truncateTables(tables: string[]): Promise<void> {
  for (const table of tables) {
    if (!TABLE_NAME.test(table)) {
      throw new Error(`Nom de table refusé : « ${table} ».`);
    }
  }

  const cleaner = new PrismaClient({ datasources: { db: { url: singleConnectionUrl() } } });
  try {
    // Vérification sur la connexion même qui va supprimer.
    const [{ db }] = await cleaner.$queryRawUnsafe<{ db: string }[]>('SELECT DATABASE() AS db');
    if (!db?.endsWith('_test')) {
      throw new Error(`Remise à zéro refusée : la connexion pointe sur « ${db} », pas sur une base de test.`);
    }

    await cleaner.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
    try {
      for (const table of tables) {
        await cleaner.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\``);
      }
    } finally {
      await cleaner.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
    }
  } finally {
    await cleaner.$disconnect();
  }
}

/** Tables métier de la base de test (hors historique des migrations). */
async function businessTables(): Promise<string[]> {
  const rows = await testPrisma().$queryRawUnsafe<{ TABLE_NAME: string }[]>(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME <> '_prisma_migrations'",
  );
  return rows.map((row) => row.TABLE_NAME);
}

/** Vide toutes les tables métier et le dossier d'upload de test. */
export async function resetDatabase(): Promise<void> {
  await truncateTables(await businessTables());
  resetUploads();
}

/** Dossier d'upload des tests — jamais celui du développement. */
export function testUploadDir(): string {
  return join(API_ROOT, TEST_UPLOAD_DIR);
}

export function resetUploads(): void {
  const dir = testUploadDir();
  if (!dir.includes('uploads') || !dir.endsWith('test')) {
    throw new Error(`Dossier d'upload de test inattendu : ${dir}`);
  }
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

export async function closeTestPrisma(): Promise<void> {
  await client?.$disconnect();
  client = undefined;
}
