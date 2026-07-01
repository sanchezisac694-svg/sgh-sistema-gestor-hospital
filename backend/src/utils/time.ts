import { DiaSemana } from '@prisma/client';

export function timeStringToDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

export function dateToTimeString(date: Date): string {
  return date.toISOString().substring(11, 16);
}

export function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const start = timeStringToMinutes(startTime);
  const end = timeStringToMinutes(endTime);
  const slots: string[] = [];

  for (let current = start; current + durationMinutes <= end; current += durationMinutes) {
    slots.push(minutesToTimeString(current));
  }

  return slots;
}

export function getDiaSemanaFromDate(dateString: string): DiaSemana {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  const day = date.getUTCDay();

  const map: Record<number, DiaSemana> = {
    0: 'DOMINGO',
    1: 'LUNES',
    2: 'MARTES',
    3: 'MIERCOLES',
    4: 'JUEVES',
    5: 'VIERNES',
    6: 'SABADO',
  };

  return map[day];
}
