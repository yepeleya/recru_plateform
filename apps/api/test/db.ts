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

/** Vide toutes les tables métier. Refuse de s'exécuter hors d'une base « _test ». */
export async function resetDatabase(): Promise<void> {
  const prisma = testPrisma();
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>('SELECT DATABASE() AS db');
  if (!db?.endsWith('_test')) {
    throw new Error(`Remise à zéro refusée : la connexion pointe sur « ${db} », pas sur une base de test.`);
  }

  const tables = await prisma.$queryRawUnsafe<{ TABLE_NAME: string }[]>(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME <> '_prisma_migrations'",
  );

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  for (const { TABLE_NAME } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${TABLE_NAME}\``);
  }
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');

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
