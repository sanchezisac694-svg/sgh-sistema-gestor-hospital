import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import * as doctorPanelService from './doctor-panel.service';

function getAuthUserId(req: Request) {
  if (!req.user) {
    throw new AppError('No autenticado. Token requerido.', 401);
  }

  return req.user.id;
}

function getIdParam(req: Request) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    throw new AppError('ID de cita invalido.', 400);
  }

  return id;
}

export async function getDoctorDashboardController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dashboard = await doctorPanelService.getDoctorDashboard(getAuthUserId(req));
    return successResponse(res, 'Dashboard del doctor obtenido correctamente', dashboard);
  } catch (error) {
    return next(error);
  }
}

export async function getMyDoctorAppointmentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointments = await doctorPanelService.getMyDoctorAppointments(
      getAuthUserId(req),
      req.query
    );
    return successResponse(res, 'Citas del doctor obtenidas correctamente', appointments);
  } catch (error) {
    return next(error);
  }
}

export async function getTodayDoctorAppointmentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointments = await doctorPanelService.getTodayDoctorAppointments(
      getAuthUserId(req)
    );
    return successResponse(res, 'Citas de hoy del doctor obtenidas correctamente', appointments);
  } catch (error) {
    return next(error);
  }
}

export async function getMyDoctorScheduleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schedules = await doctorPanelService.getMyDoctorSchedule(
      getAuthUserId(req),
      req.query.estado
    );
    return successResponse(res, 'Horario del doctor obtenido correctamente', schedules);
  } catch (error) {
    return next(error);
  }
}

export async function getMyDoctorProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await doctorPanelService.getMyDoctorProfile(getAuthUserId(req));
    return successResponse(res, 'Perfil del doctor obtenido correctamente', profile);
  } catch (error) {
    return next(error);
  }
}

export async function getMyDoctorAppointmentByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await doctorPanelService.getMyDoctorAppointmentById(
      getAuthUserId(req),
      getIdParam(req)
    );
    return successResponse(res, 'Cita del doctor obtenida correctamente', appointment);
  } catch (error) {
    return next(error);
  }
}
