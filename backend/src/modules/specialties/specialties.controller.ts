import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import * as specialtiesService from './specialties.service';

function getIdParam(req: Request) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    throw new AppError('ID de especialidad invalido.', 400);
  }

  return id;
}

function shouldIncludeInactive(req: Request) {
  return req.query.admin === 'true';
}

export async function getSpecialtiesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const specialties = await specialtiesService.getSpecialties(
      req.query,
      shouldIncludeInactive(req)
    );
    return successResponse(res, 'Especialidades obtenidas correctamente', specialties);
  } catch (error) {
    return next(error);
  }
}

export async function getSpecialtyByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const specialty = await specialtiesService.getSpecialtyById(
      getIdParam(req),
      shouldIncludeInactive(req)
    );
    return successResponse(res, 'Especialidad obtenida correctamente', specialty);
  } catch (error) {
    return next(error);
  }
}

export async function createSpecialtyController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const specialty = await specialtiesService.createSpecialty(req.body);
    return successResponse(res, 'Especialidad creada correctamente', specialty, 201);
  } catch (error) {
    return next(error);
  }
}

export async function updateSpecialtyController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const specialty = await specialtiesService.updateSpecialty(
      getIdParam(req),
      req.body
    );
    return successResponse(res, 'Especialidad actualizada correctamente', specialty);
  } catch (error) {
    return next(error);
  }
}

export async function updateSpecialtyStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const specialty = await specialtiesService.updateSpecialtyStatus(
      getIdParam(req),
      req.body
    );
    return successResponse(
      res,
      'Estado de especialidad actualizado correctamente',
      specialty
    );
  } catch (error) {
    return next(error);
  }
}
