import { z } from 'zod';

const rolSchema = z.enum([
  'ADMIN',
  'DOCTOR',
  'ENFERMERO',
  'RECEPCIONISTA',
  'PACIENTE',
]);

export const createUserSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido_paterno: z.string().min(1, 'El apellido paterno es obligatorio'),
    apellido_materno: z.string().optional().nullable(),
    correo: z.string().email('Correo electronico invalido'),
    password: z
      .string()
      .min(8, 'La contrasena debe tener al menos 8 caracteres'),
    telefono: z.string().optional().nullable(),
    rol: rolSchema,
    estado: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    nombre: z.string().min(1).optional(),
    apellido_paterno: z.string().min(1).optional(),
    apellido_materno: z.string().optional().nullable(),
    correo: z.string().email('Correo electronico invalido').optional(),
    telefono: z.string().optional().nullable(),
    rol: rolSchema.optional(),
    estado: z.boolean().optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    estado: z.boolean('El estado es obligatorio'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateUserStatusInput = z.infer<
  typeof updateUserStatusSchema
>['body'];
