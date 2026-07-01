import { Prisma } from '@prisma/client';
import { ErrorRequestHandler } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/response';

type ErrorDetails = {
  message?: string;
  stack?: string;
};

function isProduction() {
  return env.nodeEnv === 'production';
}

function buildUnexpectedErrors(error: ErrorDetails) {
  return isProduction() ? [] : [{ message: error.message, stack: error.stack }];
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return errorResponse(res, error.message, error.errors, error.statusCode);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return errorResponse(
        res,
        'Conflicto: el registro ya existe.',
        isProduction()
          ? []
          : [
              {
                target: error.meta?.target,
              },
            ],
        409
      );
    }

    if (error.code === 'P2025') {
      return errorResponse(res, 'Recurso no encontrado.', [], 404);
    }

    return errorResponse(
      res,
      'Error de base de datos.',
      buildUnexpectedErrors(error),
      500
    );
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return errorResponse(
      res,
      'Datos invalidos.',
      buildUnexpectedErrors(error),
      400
    );
  }

  const message = isProduction()
    ? 'Ocurrio un error interno en el servidor.'
    : error.message || 'Ocurrio un error interno en el servidor.';

  return errorResponse(res, message, buildUnexpectedErrors(error), 500);
};
