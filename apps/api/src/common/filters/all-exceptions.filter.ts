import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}

// Filtre d'exception global — garantit un format de réponse d'erreur uniforme
// { statusCode, message, error } sur toute l'API (CLAUDE.md Partie 4 §9).
// Les erreurs non prévues (500) ne fuient jamais de détail interne au client
// (message générique), mais sont journalisées côté serveur. On ne logge jamais
// le corps de la requête (peut contenir une pièce d'identité — Partie 7 §9).
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const body: ErrorBody =
        typeof response === 'string'
          ? { statusCode: status, message: response, error: exception.name }
          : {
              statusCode: status,
              message: (response as { message?: string | string[] }).message ?? exception.message,
              error: (response as { error?: string }).error ?? exception.name,
            };
      res.status(status).json(body);
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Une erreur interne est survenue.',
      error: 'InternalServerError',
    } satisfies ErrorBody);
  }
}
