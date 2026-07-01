import { z } from 'zod';

export const createDoctorSchema = z.object({
  body: z.object({
    usuario: z.object({
      nombre: z.string().min(1, 'El nombre es obligatorio'),
      apellido_paterno: z.string().min(1, 'El apellido paterno es obligatorio'),
      apellido_materno: z.string().optional().nullable(),
      correo: z.string().email('Correo electronico invalido'),
      password: z
        .string()
        .min(8, 'La contrasena debe tener al menos 8 caracteres'),
      telefono: z.string().optional().nullable(),
    }),
    especialidad_id: z.string().uuid('Especialidad invalida'),
    cedula_profesional: z
      .string()
      .min(1, 'La cedula profesional es obligatoria'),
    consultorio: z.string().min(1, 'El consultorio es obligatorio'),
    biografia: z.string().optional().nullable(),
    foto_url: z.string().optional().nullable(),
    estado: z.boolean().optional(),
  }),
});

export const updateDoctorSchema = z.object({
  body: z.object({
    usuario: z
      .object({
        nombre: z.string().min(1).optional(),
        apellido_paterno: z.string().min(1).optional(),
        apellido_materno: z.string().optional().nullable(),
        correo: z.string().email('Correo electronico invalido').optional(),
        telefono: z.string().optional().nullable(),
      })
      .optional(),
    especialidad_id: z.string().uuid('Especialidad invalida').optional(),
    cedula_profesional: z.string().min(1).optional(),
    consultorio: z.string().min(1).optional(),
    biografia: z.string().optional().nullable(),
    foto_url: z.string().optional().nullable(),
    estado: z.boolean().optional(),
  }),
});

export const updateDoctorStatusSchema = z.object({
  body: z.object({
    estado: z.boolean('El estado es obligatorio'),
  }),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>['body'];
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>['body'];
export type UpdateDoctorStatusInput = z.infer<
  typeof updateDoctorStatusSchema
>['body'];
