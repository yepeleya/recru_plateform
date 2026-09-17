// Application NestJS RÉELLE pour les tests HTTP : mêmes modules, mêmes guards,
// mêmes pipes, même filtre d'exception et même préfixe que la production
// (configureApp est partagé avec main.ts). Aucun guard n'est neutralisé.
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app-setup';

export const API_PREFIX = '/api/v1';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

export const http = (app: INestApplication) => request(app.getHttpServer());

export function cookieValue(setCookies: string[] | undefined, name: string): string | undefined {
  for (const cookie of setCookies ?? []) {
    const [pair] = cookie.split(';');
    const index = pair.indexOf('=');
    if (pair.slice(0, index).trim() === name && pair.slice(index + 1)) return pair.slice(index + 1);
  }
  return undefined;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
}

/** Connexion par l'endpoint réel : les jetons viennent du vrai flux d'authentification. */
export async function login(app: INestApplication, email: string, password: string): Promise<Session> {
  const res = await http(app).post(`${API_PREFIX}/auth/login`).send({ email, password }).expect(201);
  const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
  return {
    accessToken: cookieValue(cookies, 'bara_access')!,
    refreshToken: cookieValue(cookies, 'bara_refresh')!,
  };
}

export const decodeJwt = <T = Record<string, unknown>>(token: string): T =>
  JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as T;
