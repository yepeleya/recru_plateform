import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { PrismaService } from '../prisma/prisma.service';
import type { UsersService } from '../users/users.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

// Secret de test uniquement.
const TEST_SECRET = 'test-secret-for-auth-service-spec-0123456789';
const PASSWORD = 'MotDePasse2026';

interface Row {
  id: string;
  userId: string;
  sessionId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

// Base en mémoire, limitée aux opérations utilisées par AuthService. Les
// transactions réelles (MySQL) sont vérifiées par la sonde HTTP, pas ici.
function makeFakePrisma(users: Array<{ id: string; email: string; role: string }>) {
  const rows: Row[] = [];
  const matches = (row: Row, where: Record<string, unknown>) =>
    Object.entries(where).every(([key, value]) => row[key as keyof Row] === value);

  const prisma = {
    rows,
    user: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => users.find((u) => u.id === where.id) ?? null),
      create: jest.fn(async ({ data }: { data: { email: string } }) => {
        const user = { id: 'user-new', email: data.email, role: 'USER' };
        users.push(user);
        return user;
      }),
    },
    refreshToken: {
      create: jest.fn(async ({ data }: { data: Omit<Row, 'revokedAt'> }) => {
        const row = { ...data, revokedAt: null };
        rows.push(row);
        return row;
      }),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => rows.find((r) => r.id === where.id) ?? null),
      updateMany: jest.fn(
        async ({ where, data }: { where: Record<string, unknown>; data: Partial<Row> }) => {
          const hit = rows.filter((row) => matches(row, where));
          hit.forEach((row) => Object.assign(row, data));
          return { count: hit.length };
        },
      ),
    },
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(prisma)),
  };
  return prisma;
}

describe('AuthService — sessions', () => {
  const jwt = new JwtService({ secret: TEST_SECRET });
  let prisma: ReturnType<typeof makeFakePrisma>;
  let service: AuthService;

  const sidOf = (token: string) => (jwt.decode(token) as { sid?: string }).sid;
  const jtiOf = (token: string) => (jwt.decode(token) as { jti: string }).jti;
  const login = () => service.login({ email: 'sonde@example.com', password: PASSWORD } as LoginDto);

  beforeEach(() => {
    const user = { id: 'user-1', email: 'sonde@example.com', role: 'USER' };
    prisma = makeFakePrisma([user]);
    const usersService = {
      findByEmail: jest.fn(async (email: string) =>
        email === user.email ? { ...user, passwordHash: bcrypt.hashSync(PASSWORD, 4) } : null,
      ),
    };
    service = new AuthService(
      usersService as unknown as UsersService,
      prisma as unknown as PrismaService,
      jwt,
      new ConfigService({ JWT_SECRET: TEST_SECRET }),
    );
  });

  it('la connexion ouvre une session : l’access token porte le sid de son refresh token', async () => {
    const tokens = await login();
    const sid = sidOf(tokens.accessToken);
    expect(sid).toBeDefined();
    expect(prisma.rows).toHaveLength(1);
    expect(prisma.rows[0].sessionId).toBe(sid);
    expect(prisma.rows[0].id).toBe(jtiOf(tokens.refreshToken));
  });

  it('l’inscription ouvre aussi une session', async () => {
    const dto = {
      accountType: 'candidat',
      email: 'nouveau@example.com',
      password: PASSWORD,
      phone: '0700000000',
      city: 'Abidjan',
      firstName: 'Sonde',
      lastName: 'Test',
      idDocumentType: 'passeport',
      idDocumentNumber: 'X1',
    } as RegisterDto;
    const tokens = await service.register(dto, { idFrontFile: [{ filename: 'front.png' } as Express.Multer.File] });
    expect(sidOf(tokens.accessToken)).toBe(prisma.rows[0].sessionId);
  });

  it('deux connexions ouvrent deux sessions distinctes', async () => {
    const a = await login();
    const b = await login();
    expect(sidOf(a.accessToken)).not.toBe(sidOf(b.accessToken));
  });

  it('la rotation conserve la session et ne crée pas de nouvelle session', async () => {
    const first = await login();
    const rotated = await service.refreshTokens(first.refreshToken);

    expect(sidOf(rotated.accessToken)).toBe(sidOf(first.accessToken));
    expect(new Set(prisma.rows.map((r) => r.sessionId)).size).toBe(1);
    expect(prisma.rows).toHaveLength(2);
    expect(prisma.rows.find((r) => r.id === jtiOf(first.refreshToken))?.revokedAt).not.toBeNull();
    expect(prisma.rows.find((r) => r.id === jtiOf(rotated.refreshToken))?.revokedAt).toBeNull();
  });

  it('un refresh token déjà tourné est refusé', async () => {
    const first = await login();
    await service.refreshTokens(first.refreshToken);
    await expect(service.refreshTokens(first.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deux rafraîchissements simultanés du même token : un seul réussit', async () => {
    const first = await login();
    const results = await Promise.allSettled([
      service.refreshTokens(first.refreshToken),
      service.refreshTokens(first.refreshToken),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(prisma.rows.filter((r) => r.revokedAt === null)).toHaveLength(1);
  });

  it('le logout par access token révoque toute la session, rotations comprises', async () => {
    const first = await login();
    const rotated = await service.refreshTokens(first.refreshToken);
    await service.revokeSession({ accessToken: first.accessToken });

    const sid = sidOf(first.accessToken);
    expect(prisma.rows.filter((r) => r.sessionId === sid && r.revokedAt === null)).toHaveLength(0);
    await expect(service.refreshTokens(rotated.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('le logout par refresh token seul révoque aussi la session', async () => {
    const first = await login();
    await service.revokeSession({ refreshToken: first.refreshToken });
    expect(prisma.rows.every((r) => r.revokedAt !== null)).toBe(true);
  });

  it('le logout d’une session laisse les autres sessions du compte intactes', async () => {
    const a = await login();
    const b = await login();
    await service.revokeSession({ accessToken: a.accessToken });
    expect(prisma.rows.find((r) => r.sessionId === sidOf(b.accessToken))?.revokedAt).toBeNull();
  });

  it('un jeton illisible ne fait pas échouer le logout et ne révoque rien', async () => {
    await login();
    await expect(service.revokeSession({ accessToken: 'illisible', refreshToken: 'illisible' })).resolves.toBeUndefined();
    expect(prisma.rows.every((r) => r.revokedAt === null)).toBe(true);
  });

  it('un refresh token ne peut pas servir à identifier une session comme un access token', async () => {
    const tokens = await login();
    await service.revokeSession({ accessToken: tokens.refreshToken });
    expect(prisma.rows.every((r) => r.revokedAt === null)).toBe(true);
  });
});
