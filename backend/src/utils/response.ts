import { Response } from 'express';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
};

export function successResponse<T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  message: string,
  errors: unknown[] = [],
  statusCode = 500
) {
  const response: ApiResponse<never> = {
    success: false,
    message,
    errors,
  };

  return res.status(statusCode).json(response);
}
