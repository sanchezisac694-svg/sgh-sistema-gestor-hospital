import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'La fecha debe tener formato YYYY-MM-DD',
});

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
  message: 'La hora debe tener formato HH:mm',
});

export const createAppointmentSchema = z.object({
  body: z.object({
    paciente_id: z.string().uuid('Paciente invalido').optional(),
    doctor_id: z.string().uuid('Doctor invalido'),
    especialidad_id: z.string().uuid('Especialidad invalida'),
    fecha: dateSchema,
    hora_inicio: timeSchema,
    motivo_consulta: z.string().min(1, 'El motivo de consulta es obligatorio'),
    observaciones_admin: z.string().optional().nullable(),
  }),
});

export const updateAppointmentSchema = z.object({
  body: z.object({
    motivo_consulta: z.string().min(1).optional(),
    observaciones_admin: z.string().optional().nullable(),
  }),
});

export const confirmAppointmentSchema = z.object({
  body: z.object({
    comentario: z.string().optional().nullable(),
  }),
});

export const cancelAppointmentSchema = z.object({
  body: z.object({
    motivo_cancelacion: z
      .string()
      .min(1, 'El motivo de cancelacion es obligatorio'),
  }),
});

export const rescheduleAppointmentSchema = z.object({
  body: z.object({
    nueva_fecha: dateSchema,
    nueva_hora_inicio: timeSchema,
    comentario: z.string().optional().nullable(),
  }),
});

export const attendAppointmentSchema = z.object({
  body: z.object({
    observaciones: z.string().min(1, 'Las observaciones son obligatorias'),
    diagnostico_inicial: z.string().optional().nullable(),
    recomendaciones: z.string().optional().nullable(),
  }),
});

export const noShowAppointmentSchema = z.object({
  body: z.object({
    comentario: z.string().optional().nullable(),
  }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>['body'];
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>['body'];
export type ConfirmAppointmentInput = z.infer<typeof confirmAppointmentSchema>['body'];
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>['body'];
export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>['body'];
export type AttendAppointmentInput = z.infer<typeof attendAppointmentSchema>['body'];
export type NoShowAppointmentInput = z.infer<typeof noShowAppointmentSchema>['body'];
