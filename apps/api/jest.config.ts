import type { Config } from 'jest';

// Configuration unique pour les tests unitaires (src/**.spec.ts) et les tests
// HTTP de bout en bout (test/**.e2e-spec.ts).
//
// maxWorkers: 1 — les tests HTTP partagent une seule base de test et la vident
// entre chaque test : les exécuter en parallèle les rendrait non reproductibles.
const config: Config = {
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
  // Variables d'environnement de test (base, secret, dossier d'upload) posées
  // avant l'import des modules applicatifs.
  setupFiles: ['<rootDir>/test/jest.setup.ts'],
  // Création de la base de test + migrations, une fois par exécution.
  globalSetup: '<rootDir>/test/global-setup.ts',
  maxWorkers: 1,
  testTimeout: 30_000,
};

export default config;
