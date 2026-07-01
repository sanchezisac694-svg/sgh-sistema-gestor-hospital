import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

type ValidatedRequestParts = {
  body?: Request['body'];
  params?: Request['params'];
  query?: Request['query'];
};

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Datos invalidos.',
        errors: result.error.issues.map((error) => ({
          field: error.path.join('.'),
          message: error.message,
        })),
      });
    }

    const data = result.data as ValidatedRequestParts;

    if (data.body !== undefined) {
      req.body = data.body;
    }

    if (data.params !== undefined) {
      req.params = data.params;
    }

    if (data.query !== undefined) {
      req.query = data.query;
    }

    return next();
  };
}
