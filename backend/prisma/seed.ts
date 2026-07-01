import { PrismaClient, RolNombre } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function time(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

async function main() {
  console.log('Iniciando seed SGH...');

  const roles = [
    {
      nombre: RolNombre.ADMIN,
      descripcion: 'Administrador general del sistema',
    },
    {
      nombre: RolNombre.DOCTOR,
      descripcion: 'Médico con acceso a sus citas, horario y perfil',
    },
    {
      nombre: RolNombre.ENFERMERO,
      descripcion: 'Personal de enfermería',
    },
    {
      nombre: RolNombre.RECEPCIONISTA,
      descripcion: 'Personal de recepción y apoyo en citas',
    },
    {
      nombre: RolNombre.PACIENTE,
      descripcion: 'Usuario paciente del sistema',
    },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: rol,
    });
  }

  const especialidades = [
    {
      nombre: 'Medicina general',
      descripcion: 'Atención médica primaria y seguimiento general del paciente',
    },
    {
      nombre: 'Pediatría',
      descripcion: 'Atención médica especializada para niños y adolescentes',
    },
    {
      nombre: 'Cardiología',
      descripcion: 'Diagnóstico y tratamiento de enfermedades del corazón',
    },
    {
      nombre: 'Ginecología',
      descripcion: 'Atención médica especializada en salud femenina',
    },
    {
      nombre: 'Otorrinolaringología',
      descripcion: 'Atención de oído, nariz y garganta',
    },
    {
      nombre: 'Gastroenterología',
      descripcion: 'Atención del sistema digestivo',
    },
    {
      nombre: 'Dermatología',
      descripcion: 'Atención de piel, cabello y uñas',
    },
    {
      nombre: 'Traumatología',
      descripcion: 'Atención de lesiones óseas, musculares y articulares',
    },
  ];

  for (const especialidad of especialidades) {
    await prisma.especialidad.upsert({
      where: { nombre: especialidad.nombre },
      update: {},
      create: especialidad,
    });
  }

  const turnos = [
    {
      nombre: 'Matutino',
      horaInicio: time('07:00'),
      horaFin: time('14:00'),
      descripcion: 'Turno de la mañana',
    },
    {
      nombre: 'Vespertino',
      horaInicio: time('14:00'),
      horaFin: time('21:00'),
      descripcion: 'Turno de la tarde',
    },
    {
      nombre: 'Nocturno',
      horaInicio: time('21:00'),
      horaFin: time('07:00'),
      descripcion: 'Turno de la noche',
    },
  ];

  for (const turno of turnos) {
    const existe = await prisma.turno.findFirst({
      where: { nombre: turno.nombre },
    });

    if (!existe) {
      await prisma.turno.create({
        data: turno,
      });
    }
  }

  const rolAdmin = await prisma.rol.findUnique({
    where: { nombre: RolNombre.ADMIN },
  });

  if (!rolAdmin) {
    throw new Error('No se encontró el rol ADMIN');
  }

  const passwordHash = await bcrypt.hash('Admin123*', 10);

  await prisma.usuario.upsert({
    where: { correo: 'admin@sgh.com' },
    update: {},
    create: {
      rolId: rolAdmin.id,
      nombre: 'Administrador',
      apellidoPaterno: 'SGH',
      apellidoMaterno: null,
      correo: 'admin@sgh.com',
      passwordHash,
      telefono: '9610000000',
      estado: true,
    },
  });

  console.log('Seed SGH ejecutado correctamente');
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
