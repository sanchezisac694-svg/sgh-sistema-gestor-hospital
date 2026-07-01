import { z } from 'zod';

const sexoSchema = z.enum([
  'MASCULINO',
  'FEMENINO',
  'OTRO',
  'NO_ESPECIFICADO',
]);

export const createPatientSchema = z.object({
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
    fecha_nacimiento: z.string().optional().nullable(),
    sexo: sexoSchema.default('NO_ESPECIFICADO'),
    direccion: z.string().optional().nullable(),
    contacto_emergencia: z.string().optional().nullable(),
    telefono_emergencia: z.string().optional().nullable(),
    estado: z.boolean().optional(),
  }),
});

export const updatePatientSchema = z.object({
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
    fecha_nacimiento: z.string().optional().nullable(),
    sexo: sexoSchema.optional(),
    direccion: z.string().optional().nullable(),
    contacto_emergencia: z.string().optional().nullable(),
    telefono_emergencia: z.string().optional().nullable(),
    estado: z.boolean().optional(),
  }),
});

export const updatePatientStatusSchema = z.object({
  body: z.object({
    estado: z.boolean('El estado es obligatorio'),
  }),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>['body'];
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>['body'];
export type UpdatePatientStatusInput = z.infer<
  typeof updatePatientStatusSchema
>['body'];
