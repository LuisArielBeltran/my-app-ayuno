import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    // 1. Crear tabla de Usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(100),
          level_assigned VARCHAR(50) CHECK (level_assigned IN ('Principiante', 'Intermedio', 'Avanzado')),
          protocol_selected VARCHAR(20) CHECK (protocol_selected IN ('12/12', '16/8', '20/4')),
          fasting_start_time TIMESTAMP,
          water_target_ml INTEGER DEFAULT 2500,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Crear tabla de Alimentos
    await client.query(`
      CREATE TABLE IF NOT EXISTS food_database (
          id SERIAL PRIMARY KEY,
          food_name VARCHAR(150) NOT NULL,
          breaks_fast BOOLEAN NOT NULL,
          category VARCHAR(50),
          explanation TEXT,
          icon_url VARCHAR(255)
      );
    `);

    // 3. Crear tabla de Hidratación
    await client.query(`
      CREATE TABLE IF NOT EXISTS water_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          log_date DATE DEFAULT CURRENT_DATE,
          volume_ml INTEGER DEFAULT 250,
          logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();

    return NextResponse.json({ 
      success: true, 
      message: 'Las tablas se crearon correctamente evadiendo el bloqueo de Railway.' 
    });
  } catch (error: any) {
    console.error('Error creando tablas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
