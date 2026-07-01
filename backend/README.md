# SGH Backend

Backend para **SGH - Sistema Gestor de Hospital**.

## Stack

- Node.js
- Express.js
- TypeScript
- CORS
- Dotenv
- TSX para desarrollo
- Prisma ORM
- PostgreSQL
- JWT

## Scripts

```bash
npm run dev
npm run build
npm start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:dev
npm run prisma:studio
npm run prisma:seed
```

`prisma:migrate` usa `prisma migrate deploy` y es el comando preparado para produccion.
`prisma:migrate:dev` usa `prisma migrate dev` y es solo para desarrollo local.

## Variables de entorno

```env
NODE_ENV="development"
PORT=3000

DATABASE_URL="postgresql://postgres:admin123@localhost:5432/sgh_db"

JWT_SECRET="sgh_super_secret_key"
JWT_EXPIRES_IN="8h"

FRONTEND_URL="http://localhost:5173"
```

Usa `backend/.env.example` como plantilla para produccion. No subas `backend/.env` al repositorio.

## Prisma

El schema se encuentra en:

```txt
backend/prisma/schema.prisma
```

Comandos comunes:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate
npm run prisma:seed
```

El seed inicial esta en `prisma/seed.ts` e incluye:

- Roles base.
- Especialidades iniciales.
- Turnos iniciales.
- Usuario administrador.

Credenciales locales:

```txt
correo: admin@sgh.com
password: Admin123*
```

### Indice parcial de citas activas

El indice unico parcial para citas activas esta incluido en migraciones:

```sql
CREATE UNIQUE INDEX unique_cita_activa_doctor_fecha_hora
ON citas (doctor_id, fecha, hora_inicio)
WHERE estado IN ('PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA');
```

Este indice evita doble agenda solo para citas activas. Las citas en estado `CANCELADA`, `ATENDIDA` o `NO_ASISTIO` no bloquean nuevamente el mismo horario.

## Health check

```txt
GET /api/health
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "Servidor SGH funcionando correctamente",
  "data": {
    "status": "OK"
  }
}
```

## Autenticacion

```txt
POST /api/auth/login
POST /api/auth/register-paciente
GET /api/auth/me
POST /api/auth/logout
```
