import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import * as appointmentsService from './appointments.service';

function getIdParam(req: Request) {
  const { id } = req.params;
  if (typeof id !== 'string') throw new AppError('ID de cita invalido.', 400);
  return id;
}

function getAuthUser(req: Request) {
  if (!req.user) throw new AppError('No autenticado. Token requerido.', 401);
  return req.user;
}

export async function getAppointmentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointments = await appointmentsService.getAppointments(req.query);
    return successResponse(res, 'Citas obtenidas correctamente', appointments);
  } catch (error) {
    return next(error);
  }
}

export async function getAppointmentByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await appointmentsService.getAppointmentById(
      getIdParam(req),
      getAuthUser(req)
    );
    return successResponse(res, 'Cita obtenida correctamente', appointment);
  } catch (error) {
    return next(error);
  }
}

export async function createAppointmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await appointmentsService.createAppointment(
      req.body,
      getAuthUser(req)
    );
    return successResponse(res, 'Cita creada correctamente', appointment, 201);
  } catch (error) {
    return next(error);
  }
}

export async function updateAppointmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await appointmentsService.updateAppointment(
      getIdParam(req),
      req.body
    );
    return successResponse(res, 'Cita actualizada correctamente', appointment);
  } catch (error) {
    return next(error);
  }
}

export async function confirmAppointmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await appointmentsService.confirmAppointment(
      getIdParam(req),
      req.body,
      getAuthUser(req)
    );
    return successResponse(res, 'Cita confirmada correctamente', appointment);
  } catch (error) {
    return next(error);
  }
}

export async function cancelAppointmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await appointmentsService.cancelAppointment(
      getIdParam(req),
      req.body,
      getAuthUser(req)
    );
    return successResponse(res, 'Cita cancelada correctamente', appointment);
  } catch (error) {
    return next(error);
  }
}

export async function rescheduleAppointmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await appointmentsService.rescheduleAppointment(
      getIdParam(req),
      req.body,
      getAuthUser(req)
    );
    return successResponse(res, 'Cita reprogramada correctamente', appointment);
  } catch (error) {
    return next(error);
  }
}

export async function attendAppointmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await appointmentsService.attendAppointment(
      getIdParam(req),
      req.body,
      getAuthUser(req)
    );
    return successResponse(res, 'Cita marcada como atendida correctamente', appointment);
  } catch (error) {
    return next(error);
  }
}

export async function markNoShowAppointmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await appointmentsService.markNoShowAppointment(
      getIdParam(req),
      req.body,
      getAuthUser(req)
    );
    return successResponse(res, 'Cita marcada como no asistio correctamente', appointment);
  } catch (error) {
    return next(error);
  }
}

export async function getMyPatientAppointmentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointments = await appointmentsService.getMyPatientAppointments(
      getAuthUser(req)
    );
    return successResponse(res, 'Mis citas obtenidas correctamente', appointments);
  } catch (error) {
    return next(error);
  }
}

export async function cancelMyPatientAppointmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await appointmentsService.cancelMyPatientAppointment(
      getIdParam(req),
      req.body,
      getAuthUser(req)
    );
    return successResponse(res, 'Cita cancelada correctamente', appointment);
  } catch (error) {
    return next(error);
  }
}
