import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { successResponse } from '../../utils/response';
import { getDoctorAvailability } from './availability.service';

export async function getDoctorAvailabilityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { doctorId } = req.params;

    if (typeof doctorId !== 'string') {
      throw new AppError('ID de doctor invalido.', 400);
    }

    const data = await getDoctorAvailability(doctorId, req.query.fecha);
    const message = data.horariosDisponibles.length
      ? 'Horarios disponibles obtenidos correctamente'
      : 'No hay horarios disponibles para la fecha seleccionada.';

    return successResponse(res, message, data);
  } catch (error) {
    return next(error);
  }
}
