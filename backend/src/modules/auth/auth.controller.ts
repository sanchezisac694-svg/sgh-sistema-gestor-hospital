import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import { getMe, login, registerPaciente } from './auth.service';

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await login(req.body);
    return successResponse(res, 'Inicio de sesion correcto.', data);
  } catch (error) {
    return next(error);
  }
}

export async function registerPacienteController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await registerPaciente(req.body);
    return successResponse(res, 'Paciente registrado correctamente.', data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function meController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return next(new AppError('No autenticado. Token requerido.', 401));
    }

    const data = await getMe(req.user.id);
    return successResponse(res, 'Usuario autenticado.', data);
  } catch (error) {
    return next(error);
  }
}

export async function logoutController(_req: Request, res: Response) {
  return successResponse(res, 'Sesion cerrada correctamente', null);
}
