import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL no esta configurado.');
}

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET no esta configurado.');
}
