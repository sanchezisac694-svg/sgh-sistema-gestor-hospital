# SGH - Sistema Gestor de Hospital

Sistema web para gestion hospitalaria con panel administrador, panel doctor, panel paciente y agenda publica de citas.

## Stack

### Frontend

- React
- Vite
- Fetch API
- LocalStorage para sesion JWT

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Bcrypt

## Estructura

El proyecto usa frontend en la raiz y backend dentro de `backend/`.

```txt
SGH/
|-- src/                    # Frontend React + Vite
|-- backend/                # Backend Node.js + Express + TypeScript
|-- package.json            # Package del frontend
|-- backend/package.json    # Package del backend
|-- backend/prisma/
|   |-- schema.prisma
|   `-- migrations/
|-- README.md
`-- .gitignore
```

## Variables de entorno

Frontend, en `.env`:

```env
VITE_API_URL="http://localhost:3000/api"
```

Backend, en `backend/.env`:

```env
NODE_ENV="development"
PORT=3000
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/sgh_db"
JWT_SECRET="sgh_super_secret_key"
JWT_EXPIRES_IN="8h"
FRONTEND_URL="http://localhost:5173"
```

Usa `.env.example` y `backend/.env.example` como plantillas. No subas archivos `.env` reales al repositorio.

## Backend local

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

Build local:

```bash
cd backend
npm run build
npm start
```

Produccion:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm start
```

## Frontend local

```bash
npm install
npm run dev
```

Build local:

```bash
npm run build
npm run preview
```

## Prisma

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate
npm run prisma:seed
```

En produccion se usa `prisma migrate deploy`, no `prisma migrate dev`.

## Admin local

```txt
Correo: admin@sgh.com
Password: Admin123*
```

## Health check

```txt
GET http://localhost:3000/api/health
```

## Despliegue recomendado

- Frontend: Vercel
- Backend: Railway
- Base de datos: Railway PostgreSQL

## Notas de repositorio

No subir:

- `.env`
- `node_modules/`
- `dist/`
- `build/`

Si subir:

- `.env.example`
- `backend/.env.example`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `src/`
- `backend/src/`
