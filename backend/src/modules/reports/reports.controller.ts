import { NextFunction, Request, Response } from 'express';
import { successResponse } from '../../utils/response';
import * as reportsService from './reports.service';

export async function getDashboardReportController(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await reportsService.getDashboardReport();
    return successResponse(res, 'Reporte dashboard obtenido correctamente', data);
  } catch (error) {
    return next(error);
  }
}

export async function getAppointmentsByStatusReportController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await reportsService.getAppointmentsByStatusReport(req.query);
    return successResponse(res, 'Reporte de citas por estado obtenido correctamente', data);
  } catch (error) {
    return next(error);
  }
}

export async function getAppointmentsByDoctorReportController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await reportsService.getAppointmentsByDoctorReport(req.query);
    return successResponse(res, 'Reporte de citas por doctor obtenido correctamente', data);
  } catch (error) {
    return next(error);
  }
}

export async function getAppointmentsBySpecialtyReportController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await reportsService.getAppointmentsBySpecialtyReport(req.query);
    return successResponse(
      res,
      'Reporte de citas por especialidad obtenido correctamente',
      data
    );
  } catch (error) {
    return next(error);
  }
}

export async function getActiveStaffReportController(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await reportsService.getActiveStaffReport();
    return successResponse(res, 'Reporte de personal activo obtenido correctamente', data);
  } catch (error) {
    return next(error);
  }
}

export async function getPatientsReportController(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await reportsService.getPatientsReport();
    return successResponse(res, 'Reporte de pacientes obtenido correctamente', data);
  } catch (error) {
    return next(error);
  }
}
