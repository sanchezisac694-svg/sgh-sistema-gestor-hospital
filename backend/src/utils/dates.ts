import { minutesToTimeString, timeStringToMinutes } from './time';

export function isPastDate(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(`${dateString}T00:00:00.000Z`);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate < today;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const total = timeStringToMinutes(time) + minutes;
  return minutesToTimeString(total);
}

export function dateStringToDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function dateToDateString(date: Date): string {
  return date.toISOString().substring(0, 10);
}

export function buildDateRangeFilter(fechaInicio?: unknown, fechaFin?: unknown) {
  const range: { gte?: Date; lte?: Date } = {};

  if (typeof fechaInicio === 'string' && fechaInicio) {
    range.gte = dateStringToDate(fechaInicio);
  }

  if (typeof fechaFin === 'string' && fechaFin) {
    range.lte = dateStringToDate(fechaFin);
  }

  return Object.keys(range).length ? range : undefined;
}
