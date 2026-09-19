// Environnement des tests — aucune valeur réelle n'est recopiée ici.
//
// L'URL de la base de test est DÉRIVÉE à l'exécution de DATABASE_URL (fichier
// .env, non versionné) en remplaçant le nom de la base par « <nom>_test », ou
// fournie explicitement par TEST_DATABASE_URL. Un garde-fou refuse toute base
// dont le nom ne se termine pas par « _test » : les tests ne peuvent donc pas
// s'exécuter sur la base de développement, même par erreur de configuration.
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Secret factice, réservé aux tests. Le vrai JWT_SECRET n'est jamais utilisé ici.
export const TEST_JWT_SECRET = 'bara-tests-secret-not-a-real-secret-0123456789';

// Dossier d'upload des tests, séparé de celui du développement.
export const TEST_UPLOAD_DIR = './uploads/test';

export const API_ROOT = join(__dirname, '..');

function readEnvFile(file: string): Record<string, string> {
  if (!existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    out[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

export function databaseNameOf(url: string): string {
  return new URL(url).pathname.replace(/^\//, '');
}

// Seul un MySQL local est accepté par défaut. Un autre hôte doit être autorisé
// explicitement, et nommément, par TEST_DATABASE_ALLOWED_HOST (voir TESTING.md).
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/** Refuse toute base qui n'est pas une base de test locale. */
export function assertTestDatabase(url: string | undefined): void {
  if (!url) {
    throw new Error('DATABASE_URL absente : les tests refusent de démarrer.');
  }
  const name = databaseNameOf(url);
  if (!name.endsWith('_test')) {
    throw new Error(
      `Base « ${name} » refusée : les tests n'acceptent qu'une base dont le nom se termine par « _test ». ` +
        'Définissez TEST_DATABASE_URL vers une base de test dédiée.',
    );
  }
  const host = new URL(url).hostname;
  const allowedHost = process.env.TEST_DATABASE_ALLOWED_HOST;
  if (!LOCAL_HOSTS.has(host) && host !== allowedHost) {
    throw new Error(
      `Hôte « ${host} » refusé : les tests n'utilisent qu'un MySQL local (localhost ou 127.0.0.1). ` +
        'Pour un autre hôte, autorisez-le explicitement avec TEST_DATABASE_ALLOWED_HOST (voir TESTING.md).',
    );
  }
}

export function resolveTestDatabaseUrl(): string {
  const explicit = process.env.TEST_DATABASE_URL;
  if (explicit) {
    assertTestDatabase(explicit);
    return explicit;
  }

  const devUrl = readEnvFile(join(API_ROOT, '.env')).DATABASE_URL;
  if (!devUrl) {
    throw new Error(
      "Impossible de déterminer la base de test : ni TEST_DATABASE_URL, ni DATABASE_URL dans apps/api/.env.",
    );
  }

  const url = new URL(devUrl);
  const devName = databaseNameOf(devUrl);
  url.pathname = `/${devName}_test`;
  const testUrl = url.toString();
  if (databaseNameOf(testUrl) === devName) {
    throw new Error('La base de test ne peut pas être la base de développement.');
  }
  assertTestDatabase(testUrl);
  return testUrl;
}
