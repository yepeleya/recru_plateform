# Tests de l'API Bara

## Lancer les tests

```bash
cd apps/api
pnpm test
```

Variantes :

```bash
pnpm test:unit    # uniquement les tests unitaires (src/**/*.spec.ts)
pnpm test:e2e     # uniquement les tests HTTP (test/**/*.e2e-spec.ts)
pnpm test -- test/roles.e2e-spec.ts   # un seul fichier
```

Prérequis : MySQL démarré (WAMP) et `apps/api/.env` renseigné, comme pour le
développement. Rien d'autre à préparer : la base de test est créée et migrée
automatiquement au démarrage de Jest.

## Isolation de la base

**Les tests ne touchent jamais la base de développement `bara`.**

| Élément | Valeur en test | Comment |
|---|---|---|
| Base de données | `bara_test` | `DATABASE_URL` de `.env`, avec le nom de base suffixé `_test` |
| Secret JWT | secret factice, défini dans `test/test-env.ts` | jamais le `JWT_SECRET` réel |
| Dossier d'upload | `apps/api/uploads/test` | jamais `uploads/private` |

- L'URL de test est **dérivée à l'exécution** : aucun identifiant réel n'est
  recopié dans un fichier versionné (`.env*` est d'ailleurs ignoré par git).
- Pour pointer ailleurs (autre serveur, autre base), définissez
  `TEST_DATABASE_URL`. Exemple :
  `TEST_DATABASE_URL="mysql://user:pass@localhost:3306/bara_test" pnpm test`
- **Garde-fou** : `assertTestDatabase()` refuse toute base dont le nom ne se
  termine pas par `_test`, et `resetDatabase()` revérifie la base réellement
  connectée (`SELECT DATABASE()`) avant de vider quoi que ce soit. Une erreur de
  configuration arrête les tests au lieu d'écrire sur `bara`.
- Aucune migration destructive n'est exécutée : `prisma migrate deploy`
  uniquement, jamais `migrate reset`.

## Remise à zéro entre les tests

`resetDatabase()` (appelé en `beforeEach` des tests HTTP) vide toutes les tables
métier avec `TRUNCATE` (contraintes de clés étrangères désactivées le temps de
l'opération) et recrée le dossier d'upload de test. Les migrations ne sont pas
rejouées : le schéma reste en place, seules les données disparaissent.

Chaque test crée donc ses propres données via `test/factories.ts`
(`createUser`, `createAdmin`, `createRecruiter`, `createIdentityDocument`,
`createOffer`). **Aucun test ne dépend d'une donnée préexistante.**

Les tests s'exécutent en série (`maxWorkers: 1`) : une base partagée vidée entre
chaque test ne supporte pas l'exécution parallèle, et la reproductibilité prime.

## Ce que les tests exercent réellement

Les tests HTTP démarrent l'**application NestJS réelle** (`AppModule` +
`configureApp`, partagé avec `main.ts`) : mêmes guards, même stratégie JWT, même
`ValidationPipe`, même filtre d'exception, même préfixe `/api/v1`, même
limitation de débit. Aucun guard n'est neutralisé pour faciliter un test.

| Fichier | Couvre |
|---|---|
| `src/**/*.spec.ts` | Unitaire : stratégie JWT, service d'authentification, contrôleur de déconnexion |
| `test/auth-sessions.e2e-spec.ts` | Session ouverte à la connexion, refus du refresh token comme jeton d'accès, session absente, rotation |
| `test/auth-revocation.e2e-spec.ts` | Déconnexion navigateur, déconnexion par refresh token, isolation entre sessions, compte supprimé |
| `test/roles.e2e-spec.ts` | Propriété d'un document, administrateur réel, jeton annonçant `ADMIN` sans l'être, candidat vs recruteur |
| `test/throttling.e2e-spec.ts` | Limitation de débit réelle sur `/auth/login` |

## Si un test échoue à cause de la base

```bash
cd apps/api
pnpm exec prisma migrate status                 # état de la base de développement
TEST_DATABASE_URL=... pnpm exec prisma migrate status   # état de la base de test
```

La base de test peut être supprimée sans risque : elle est recréée et migrée au
prochain lancement.
