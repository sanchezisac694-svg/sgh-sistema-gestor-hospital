import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import * as patientsService from './patients.service';

function getIdParam(req: Request) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    throw new AppError('ID de paciente invalido.', 400);
  }

  return id;
}

export async function getPatientsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const patients = await patientsService.getPatients(req.query);
    return successResponse(res, 'Pacientes obtenidos correctamente', patients);
  } catch (error) {
    return next(error);
  }
}

export async function getPatientByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const patient = await patientsService.getPatientById(getIdParam(req));
    return successResponse(res, 'Paciente obtenido correctamente', patient);
  } catch (error) {
    return next(error);
  }
}

export async function createPatientController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const patient = await patientsService.createPatient(req.body);
    return successResponse(res, 'Paciente creado correctamente', patient, 201);
  } catch (error) {
    return next(error);
  }
}

export async function updatePatientController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const patient = await patientsService.updatePatient(getIdParam(req), req.body);
    return successResponse(res, 'Paciente actualizado correctamente', patient);
  } catch (error) {
    return next(error);
  }
}

export async function updatePatientStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const patient = await patientsService.updatePatientStatus(
      getIdParam(req),
      req.body
    );
    return successResponse(res, 'Estado de paciente actualizado correctamente', patient);
  } catch (error) {
    return next(error);
  }
}

export async function getPatientAppointmentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointments = await patientsService.getPatientAppointments(getIdParam(req));
    return successResponse(res, 'Citas del paciente obtenidas correctamente', appointments);
  } catch (error) {
    return next(error);
  }
}

export async function getMyPatientProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError('No autenticado. Token requerido.', 401);
    }

    const profile = await patientsService.getMyPatientProfile(req.user.id);
    return successResponse(res, 'Perfil del paciente obtenido correctamente', profile);
  } catch (error) {
    return next(error);
  }
}
