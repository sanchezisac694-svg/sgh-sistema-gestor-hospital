import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import * as observationsService from './observations.service';

function getAuthUser(req: Request) {
  if (!req.user) throw new AppError('No autenticado. Token requerido.', 401);
  return req.user;
}

function getParam(req: Request, key: string) {
  const value = req.params[key];
  if (typeof value !== 'string') throw new AppError('Parametro invalido.', 400);
  return value;
}

export async function getObservationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await observationsService.getObservations(req.query);
    return successResponse(res, 'Observaciones obtenidas correctamente', data);
  } catch (error) {
    return next(error);
  }
}

export async function getObservationByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await observationsService.getObservationById(
      getParam(req, 'id'),
      getAuthUser(req)
    );
    return successResponse(res, 'Observacion obtenida correctamente', data);
  } catch (error) {
    return next(error);
  }
}

export async function getObservationByAppointmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await observationsService.getObservationByAppointment(
      getParam(req, 'citaId'),
      getAuthUser(req)
    );
    return successResponse(res, 'Observacion de cita obtenida correctamente', data);
  } catch (error) {
    return next(error);
  }
}

export async function getMyDoctorObservationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = getAuthUser(req);
    const data = await observationsService.getMyDoctorObservations(user.id);
    return successResponse(res, 'Observaciones del doctor obtenidas correctamente', data);
  } catch (error) {
    return next(error);
  }
}
