import { RolNombre } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export function roleMiddleware(...rolesPermitidos: RolNombre[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('No autenticado. Token requerido.', 401));
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return next(
        new AppError('No tienes permisos para realizar esta accion.', 403)
      );
    }

    return next();
  };
}
