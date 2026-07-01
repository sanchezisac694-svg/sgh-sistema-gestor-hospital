import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    correo: z
      .string()
      .email('El correo electronico no es valido')
      .min(1, 'El correo es obligatorio'),
    password: z.string().min(1, 'La contrasena es obligatoria'),
  }),
});

export const registerPacienteSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido_paterno: z.string().min(1, 'El apellido paterno es obligatorio'),
    apellido_materno: z.string().optional().nullable(),
    correo: z.string().email('El correo electronico no es valido'),
    password: z
      .string()
      .min(8, 'La contrasena debe tener al menos 8 caracteres'),
    telefono: z.string().optional().nullable(),
    fecha_nacimiento: z.string().optional().nullable(),
    sexo: z
      .enum(['MASCULINO', 'FEMENINO', 'OTRO', 'NO_ESPECIFICADO'])
      .default('NO_ESPECIFICADO'),
    direccion: z.string().optional().nullable(),
    contacto_emergencia: z.string().optional().nullable(),
    telefono_emergencia: z.string().optional().nullable(),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RegisterPacienteInput = z.infer<typeof registerPacienteSchema>['body'];
