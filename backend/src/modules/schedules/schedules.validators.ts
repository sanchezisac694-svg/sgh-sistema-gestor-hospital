import { z } from 'zod';

const diaSemanaSchema = z.enum([
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
]);

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
  message: 'La hora debe tener formato HH:mm',
});

export const createScheduleSchema = z.object({
  body: z.object({
    doctor_id: z.string().uuid('Doctor invalido'),
    dia_semana: diaSemanaSchema,
    hora_inicio: timeSchema,
    hora_fin: timeSchema,
    duracion_cita_minutos: z
      .number()
      .int()
      .positive('La duracion debe ser mayor a cero')
      .default(30),
    consultorio: z.string().optional().nullable(),
    estado: z.boolean().optional(),
  }),
});

export const updateScheduleSchema = z.object({
  body: z.object({
    dia_semana: diaSemanaSchema.optional(),
    hora_inicio: timeSchema.optional(),
    hora_fin: timeSchema.optional(),
    duracion_cita_minutos: z.number().int().positive().optional(),
    consultorio: z.string().optional().nullable(),
    estado: z.boolean().optional(),
  }),
});

export const updateScheduleStatusSchema = z.object({
  body: z.object({
    estado: z.boolean('El estado es obligatorio'),
  }),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>['body'];
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>['body'];
export type UpdateScheduleStatusInput = z.infer<
  typeof updateScheduleStatusSchema
>['body'];
