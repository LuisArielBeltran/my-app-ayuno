import { Pool } from 'pg';

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Subimos un poco el límite de 3 a 5 para soportar picos de tráfico en Vercel
  max: 5, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Declaración global para evitar errores de TypeScript
declare global {
  var pgPool: Pool | undefined;
}

// Patrón Singleton: Reutiliza la conexión existente o crea una nueva si no existe
const pool = global.pgPool || new Pool(poolConfig);

// En modo desarrollo, guardamos el pool en la variable global para que el 
// Hot Reloading de Next.js no cree cientos de conexiones fantasma.
if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export default pool;
