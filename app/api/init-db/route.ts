import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Usamos pool.query directo para evitar que Railway se bloquee si hay un error

    // 1. Tabla de Usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla de Alimentos (tu estructura original)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS food_database (
        id SERIAL PRIMARY KEY,
        food_name VARCHAR(150) NOT NULL,
        breaks_fast BOOLEAN NOT NULL,
        category VARCHAR(50),
        explanation TEXT,
        icon_url VARCHAR(255)
      );
    `);

    // 3. Tabla de Hidratación (Adaptada para vincularse por email)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_log (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        glasses INT DEFAULT 0,
        log_date DATE DEFAULT CURRENT_DATE
      );
    `);

    // 4. Tabla de Estado de Ayuno (Nueva para el cronómetro)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fasting_state (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_fasting BOOLEAN DEFAULT FALSE,
        start_time TIMESTAMP,
        target_hours INT DEFAULT 16
      );
    `);

    return NextResponse.json({ 
      success: true, 
      message: '¡Tablas creadas y alineadas con la versión Full exitosamente!' 
    });
  } catch (error: any) {
    console.error('Error creando tablas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
