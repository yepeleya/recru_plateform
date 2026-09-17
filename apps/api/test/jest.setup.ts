// Exécuté avant chaque fichier de test, AVANT l'import des modules applicatifs :
// le client Prisma charge .env à l'import, mais dotenv n'écrase jamais une
// variable déjà définie — ces valeurs de test gagnent donc toujours.
import { resolveTestDatabaseUrl, TEST_JWT_SECRET, TEST_UPLOAD_DIR } from './test-env';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = resolveTestDatabaseUrl();
process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
process.env.WEB_APP_URL = process.env.WEB_APP_URL ?? 'http://localhost:3100';
