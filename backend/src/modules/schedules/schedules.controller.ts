import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import * as schedulesService from './schedules.service';

function getParam(req: Request, key: string) {
  const value = req.params[key];
  if (typeof value !== 'string') {
    throw new AppError('Parametro invalido.', 400);
  }
  return value;
}

export async function getSchedulesController(req: Request, res: Response, next: NextFunction) {
  try {
    const schedules = await schedulesService.getSchedules(req.query);
    return successResponse(res, 'Horarios obtenidos correctamente', schedules);
  } catch (error) {
    return next(error);
  }
}

export async function getScheduleByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await schedulesService.getScheduleById(getParam(req, 'id'));
    return successResponse(res, 'Horario obtenido correctamente', schedule);
  } catch (error) {
    return next(error);
  }
}

export async function createScheduleController(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await schedulesService.createSchedule(req.body);
    return successResponse(res, 'Horario creado correctamente', schedule, 201);
  } catch (error) {
    return next(error);
  }
}

export async function updateScheduleController(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await schedulesService.updateSchedule(getParam(req, 'id'), req.body);
    return successResponse(res, 'Horario actualizado correctamente', schedule);
  } catch (error) {
    return next(error);
  }
}

export async function updateScheduleStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schedule = await schedulesService.updateScheduleStatus(
      getParam(req, 'id'),
      req.body
    );
    return successResponse(res, 'Estado de horario actualizado correctamente', schedule);
  } catch (error) {
    return next(error);
  }
}

export async function getSchedulesByDoctorController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schedules = await schedulesService.getSchedulesByDoctor(
      getParam(req, 'doctorId'),
      req.query.admin === 'true'
    );
    return successResponse(res, 'Horarios del doctor obtenidos correctamente', schedules);
  } catch (error) {
    return next(error);
  }
}
