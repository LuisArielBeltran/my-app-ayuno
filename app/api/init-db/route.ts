export const dynamic = 'force-dynamic';
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
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla de Métricas del Usuario (Onboarding)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        goal VARCHAR(255),
        gender VARCHAR(50),
        height_cm NUMERIC,
        weight_kg NUMERIC,
        target_weight_kg NUMERIC,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 3. Tabla de Alimentos
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

    // 4. Tabla de Hidratación
    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_log (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        glasses INT DEFAULT 0,
        log_date DATE DEFAULT CURRENT_DATE
      );
    `);

    // 5. Tabla de Estado de Ayuno
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
