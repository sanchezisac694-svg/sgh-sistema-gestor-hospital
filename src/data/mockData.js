export const appointmentRows = [
  { id: 'CIT-1024', paciente: 'Mariana Lopez', doctor: 'Dra. Ana Rivera', fecha: '29 Jun 2026', estado: 'confirmada' },
  { id: 'CIT-1025', paciente: 'Carlos Mendez', doctor: 'Dr. Luis Herrera', fecha: '29 Jun 2026', estado: 'pendiente' },
  { id: 'CIT-1026', paciente: 'Elena Torres', doctor: 'Dra. Ana Rivera', fecha: '30 Jun 2026', estado: 'cancelada' },
];

export const doctorAppointments = [
  { id: '08:30', paciente: 'Sofia Perez', motivo: 'Consulta general', estado: 'confirmada' },
  { id: '10:00', paciente: 'Jorge Salas', motivo: 'Seguimiento', estado: 'pendiente' },
  { id: '12:15', paciente: 'Nadia Ramos', motivo: 'Resultados', estado: 'confirmada' },
];

export const specialties = [
  'Medicina general',
  'Pediatría',
  'Cardiología',
  'Ginecología',
  'Otorrinolaringología',
  'Gastroenterología',
  'Dermatología',
  'Traumatologia',
];

export const especialidades = [
  'Medicina general',
  'Pediatría',
  'Cardiología',
  'Ginecología',
  'Otorrinolaringología',
  'Gastroenterología',
  'Dermatología',
  'Traumatología',
];

export const specialtyDescriptions = {
  'Medicina general': 'Atención primaria para diagnóstico, prevención y seguimiento integral.',
  'Pediatría': 'Cuidado médico especializado para niñas, niños y adolescentes.',
  'Cardiología': 'Atención especializada para el diagnóstico y seguimiento de enfermedades del corazón.',
  'Ginecología': 'Atención preventiva, diagnóstico y seguimiento de salud femenina.',
  'Otorrinolaringología': 'Diagnóstico y tratamiento de oído, nariz y garganta.',
  'Gastroenterología': 'Atención para padecimientos digestivos, hepáticos e intestinales.',
  'Dermatología': 'Diagnóstico y cuidado de piel, cabello y uñas.',
  'Traumatología': 'Atención de lesiones musculares, articulares y óseas.',
};

export const doctores = [
  {
    id: 1,
    nombre: 'Dr. Juan Pérez López',
    especialidad: 'Cardiología',
    cedula: '1234567',
    consultorio: 'C-204',
    disponibilidad: 'Lun - Vie',
    estado: 'Disponible hoy',
    iniciales: 'JP',
    experiencia: '12 años',
    idiomas: 'Español, Inglés',
  },
  {
    id: 2,
    nombre: 'Dra. María González Ruiz',
    especialidad: 'Pediatría',
    cedula: '2345678',
    consultorio: 'C-105',
    disponibilidad: 'Lun - Jue',
    estado: 'Pocos espacios',
    iniciales: 'MG',
    experiencia: '9 años',
    idiomas: 'Español',
  },
  {
    id: 3,
    nombre: 'Dr. Carlos Hernández Díaz',
    especialidad: 'Otorrinolaringología',
    cedula: '3456789',
    consultorio: 'C-302',
    disponibilidad: 'Mar - Vie',
    estado: 'Próxima disponibilidad',
    iniciales: 'CH',
    experiencia: '11 años',
    idiomas: 'Español, Inglés',
  },
  {
    id: 4,
    nombre: 'Dra. Ana Martínez Torres',
    especialidad: 'Gastroenterología',
    cedula: '4567890',
    consultorio: 'C-210',
    disponibilidad: 'Lun - Vie',
    estado: 'Disponible hoy',
    iniciales: 'AM',
    experiencia: '10 años',
    idiomas: 'Español',
  },
];

export const horariosDisponibles = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
];

export const horariosOcupados = ['09:30', '11:00'];

export const horariosDoctor = [
  { dia: 'Lunes', horario: '08:00 - 14:00' },
  { dia: 'Martes', horario: '08:00 - 14:00' },
  { dia: 'Miércoles', horario: '10:00 - 16:00' },
  { dia: 'Jueves', horario: '08:00 - 14:00' },
  { dia: 'Viernes', horario: '08:00 - 13:00' },
];
