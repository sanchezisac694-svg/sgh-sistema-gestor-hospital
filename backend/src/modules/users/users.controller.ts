import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import * as usersService from './users.service';

function getIdParam(req: Request) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    throw new AppError('ID de usuario invalido.', 400);
  }

  return id;
}

export async function getUsersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await usersService.getUsers(req.query);
    return successResponse(res, 'Usuarios obtenidos correctamente', users);
  } catch (error) {
    return next(error);
  }
}

export async function getUserByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await usersService.getUserById(getIdParam(req));
    return successResponse(res, 'Usuario obtenido correctamente', user);
  } catch (error) {
    return next(error);
  }
}

export async function createUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await usersService.createUser(req.body);
    return successResponse(res, 'Usuario creado correctamente', user, 201);
  } catch (error) {
    return next(error);
  }
}

export async function updateUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await usersService.updateUser(getIdParam(req), req.body);
    return successResponse(res, 'Usuario actualizado correctamente', user);
  } catch (error) {
    return next(error);
  }
}

export async function updateUserStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await usersService.updateUserStatus(getIdParam(req), req.body);
    return successResponse(res, 'Estado de usuario actualizado correctamente', user);
  } catch (error) {
    return next(error);
  }
}
