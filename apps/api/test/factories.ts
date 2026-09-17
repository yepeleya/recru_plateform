// Fabriques minimales : chaque test crée ses propres données, aucune ne dépend
// d'un contenu préexistant. Les rôles (dont ADMIN) sont créés explicitement.
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { testPrisma, testUploadDir } from './db';

export const TEST_PASSWORD = 'MotDePasse2026';

export function uniqueEmail(prefix: string): string {
  return `${prefix}.${randomUUID().slice(0, 8)}@example.test`;
}

interface UserOptions {
  email?: string;
  password?: string;
  accountType?: 'candidat' | 'recruteur-particulier' | 'recruteur-entreprise';
  role?: 'USER' | 'ADMIN' | 'SUPPORT';
  city?: string;
}

export async function createUser(options: UserOptions = {}) {
  const email = options.email ?? uniqueEmail('user');
  const password = options.password ?? TEST_PASSWORD;
  // 4 tours : suffisant pour un test, bien plus rapide que les 12 de production.
  const passwordHash = await bcrypt.hash(password, 4);

  const user = await testPrisma().user.create({
    data: {
      email,
      passwordHash,
      accountType: options.accountType ?? 'candidat',
      role: options.role ?? 'USER',
      phone: '0700000000',
      city: options.city ?? 'Abidjan',
      firstName: 'Test',
      lastName: 'Utilisateur',
    },
  });

  return { ...user, password };
}

export const createAdmin = (options: UserOptions = {}) =>
  createUser({ ...options, role: 'ADMIN', email: options.email ?? uniqueEmail('admin') });

export const createRecruiter = (options: UserOptions = {}) =>
  createUser({ ...options, accountType: options.accountType ?? 'recruteur-particulier' });

/** Pièce d'identité + fichier réel dans le dossier d'upload de test. */
export async function createIdentityDocument(userId: string) {
  const fileName = `${randomUUID()}.png`;
  writeFileSync(join(testUploadDir(), fileName), Buffer.from('89504e470d0a1a0a', 'hex'));
  const document = await testPrisma().identityDocument.create({
    data: { userId, type: 'passeport', number: 'TEST-1', frontFileKey: fileName },
  });
  return { ...document, fileName };
}

export async function createOffer(recruiterId: string, overrides: { status?: string; title?: string } = {}) {
  const title = overrides.title ?? 'Mission de test';
  return testPrisma().jobOffer.create({
    data: {
      slug: `mission-test-${randomUUID().slice(0, 8)}`,
      title,
      description: 'Description de test.',
      metierSlug: 'graphiste',
      type: 'mission-ponctuelle',
      city: 'Abidjan',
      status: overrides.status ?? 'published',
      recruiterId,
    },
  });
}
