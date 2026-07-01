import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No autenticado. Token requerido.', 401));
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.usuarioId },
      include: {
        rol: true,
      },
    });

    if (!usuario) {
      return next(new AppError('Usuario no encontrado.', 401));
    }

    if (!usuario.estado) {
      return next(new AppError('El usuario se encuentra inactivo.', 403));
    }

    req.user = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol.nombre,
    };

    return next();
  } catch (_error) {
    return next(new AppError('Token invalido o expirado.', 401));
  }
}
