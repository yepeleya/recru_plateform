// Garde-fou de la base de test : aucune connexion n'est ouverte ici, on vérifie
// uniquement les refus et acceptations.
import { assertTestDatabase, databaseNameOf, resolveTestDatabaseUrl } from './test-env';

describe('Garde-fou de la base de test', () => {
  const saved = {
    allowed: process.env.TEST_DATABASE_ALLOWED_HOST,
    explicit: process.env.TEST_DATABASE_URL,
  };

  afterEach(() => {
    if (saved.allowed === undefined) delete process.env.TEST_DATABASE_ALLOWED_HOST;
    else process.env.TEST_DATABASE_ALLOWED_HOST = saved.allowed;
    if (saved.explicit === undefined) delete process.env.TEST_DATABASE_URL;
    else process.env.TEST_DATABASE_URL = saved.explicit;
  });

  it('refuse la base de développement « bara »', () => {
    expect(() => assertTestDatabase('mysql://root@localhost:3306/bara')).toThrow(/bara.*refusée/);
  });

  it('refuse toute base dont le nom ne se termine pas par « _test »', () => {
    expect(() => assertTestDatabase('mysql://root@localhost:3306/production')).toThrow(/_test/);
    expect(() => assertTestDatabase('mysql://root@localhost:3306/bara_tests')).toThrow(/_test/);
    expect(() => assertTestDatabase('mysql://root@localhost:3306/test_bara')).toThrow(/_test/);
  });

  it('refuse une URL absente', () => {
    expect(() => assertTestDatabase(undefined)).toThrow(/absente/);
  });

  it('accepte une base « _test » sur localhost, 127.0.0.1 et ::1', () => {
    expect(() => assertTestDatabase('mysql://root@localhost:3306/bara_test')).not.toThrow();
    expect(() => assertTestDatabase('mysql://root@127.0.0.1:3306/bara_test')).not.toThrow();
    expect(() => assertTestDatabase('mysql://root@[::1]:3306/bara_test')).not.toThrow();
  });

  it('refuse un hôte distant, même avec une base « _test »', () => {
    delete process.env.TEST_DATABASE_ALLOWED_HOST;
    expect(() => assertTestDatabase('mysql://root@db.example.com:3306/bara_test')).toThrow(/Hôte/);
    expect(() => assertTestDatabase('mysql://root@10.0.0.5:3306/bara_test')).toThrow(/Hôte/);
  });

  it('accepte un hôte distant seulement s’il est autorisé nommément', () => {
    process.env.TEST_DATABASE_ALLOWED_HOST = 'ci-mysql';
    expect(() => assertTestDatabase('mysql://root@ci-mysql:3306/bara_test')).not.toThrow();
    expect(() => assertTestDatabase('mysql://root@autre-hote:3306/bara_test')).toThrow(/Hôte/);
  });

  it('refuse une TEST_DATABASE_URL qui pointe sur « bara »', () => {
    process.env.TEST_DATABASE_URL = 'mysql://root@localhost:3306/bara';
    expect(() => resolveTestDatabaseUrl()).toThrow(/refusée/);
  });

  it('dérive de .env une base locale suffixée « _test »', () => {
    delete process.env.TEST_DATABASE_URL;
    const url = resolveTestDatabaseUrl();
    expect(databaseNameOf(url)).toMatch(/_test$/);
    expect(['localhost', '127.0.0.1', '::1', '[::1]']).toContain(new URL(url).hostname);
  });
});
