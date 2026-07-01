import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import * as doctorsService from './doctors.service';

function getIdParam(req: Request) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    throw new AppError('ID de doctor invalido.', 400);
  }

  return id;
}

function getSpecialtyIdParam(req: Request) {
  const { especialidadId } = req.params;

  if (typeof especialidadId !== 'string') {
    throw new AppError('ID de especialidad invalido.', 400);
  }

  return especialidadId;
}

function shouldIncludeInactive(req: Request) {
  return req.query.admin === 'true';
}

export async function getDoctorsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const doctors = await doctorsService.getDoctors(
      req.query,
      shouldIncludeInactive(req)
    );
    return successResponse(res, 'Doctores obtenidos correctamente', doctors);
  } catch (error) {
    return next(error);
  }
}

export async function getDoctorByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const doctor = await doctorsService.getDoctorById(
      getIdParam(req),
      shouldIncludeInactive(req)
    );
    return successResponse(res, 'Doctor obtenido correctamente', doctor);
  } catch (error) {
    return next(error);
  }
}

export async function createDoctorController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const doctor = await doctorsService.createDoctor(req.body);
    return successResponse(res, 'Doctor creado correctamente', doctor, 201);
  } catch (error) {
    return next(error);
  }
}

export async function updateDoctorController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const doctor = await doctorsService.updateDoctor(getIdParam(req), req.body);
    return successResponse(res, 'Doctor actualizado correctamente', doctor);
  } catch (error) {
    return next(error);
  }
}

export async function updateDoctorStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const doctor = await doctorsService.updateDoctorStatus(
      getIdParam(req),
      req.body
    );
    return successResponse(res, 'Estado de doctor actualizado correctamente', doctor);
  } catch (error) {
    return next(error);
  }
}

export async function getDoctorsBySpecialtyController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const doctors = await doctorsService.getDoctorsBySpecialty(
      getSpecialtyIdParam(req)
    );
    return successResponse(
      res,
      'Doctores por especialidad obtenidos correctamente',
      doctors
    );
  } catch (error) {
    return next(error);
  }
}
