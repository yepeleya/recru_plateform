// Préparation de la base de test, une fois par exécution de Jest.
//
// `prisma migrate deploy` crée la base si elle n'existe pas, puis applique les
// migrations existantes. Jamais `migrate reset`, jamais la base de développement :
// l'URL vient de resolveTestDatabaseUrl(), qui refuse toute base non suffixée
// « _test ».
import { execFileSync } from 'child_process';
import { API_ROOT, resolveTestDatabaseUrl } from './test-env';

module.exports = async function globalSetup(): Promise<void> {
  const url = resolveTestDatabaseUrl();
  const prismaCli = require.resolve('prisma/build/index.js', { paths: [API_ROOT] });

  execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    cwd: API_ROOT,
    env: { ...process.env, DATABASE_URL: url },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
};
