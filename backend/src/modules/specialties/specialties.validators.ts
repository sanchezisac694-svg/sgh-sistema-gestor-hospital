import { z } from 'zod';

export const createSpecialtySchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre de la especialidad es obligatorio'),
    descripcion: z.string().optional().nullable(),
    estado: z.boolean().optional(),
  }),
});

export const updateSpecialtySchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre no puede estar vacio').optional(),
    descripcion: z.string().optional().nullable(),
    estado: z.boolean().optional(),
  }),
});

export const updateSpecialtyStatusSchema = z.object({
  body: z.object({
    estado: z.boolean('El estado es obligatorio'),
  }),
});

export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>['body'];
export type UpdateSpecialtyInput = z.infer<typeof updateSpecialtySchema>['body'];
export type UpdateSpecialtyStatusInput = z.infer<
  typeof updateSpecialtyStatusSchema
>['body'];
