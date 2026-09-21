import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 3, // Limita las conexiones simultáneas para que Railway no sufra bloqueos
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default pool;



