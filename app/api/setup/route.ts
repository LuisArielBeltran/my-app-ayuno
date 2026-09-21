import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 1. Tabla de Usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla de Registro de Agua
    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_log (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        glasses INT DEFAULT 0,
        log_date DATE DEFAULT CURRENT_DATE
      );
    `);

    // 3. Tabla de Estado de Ayuno
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
      message: "¡Tablas para la versión Full creadas con éxito! Ya no dependemos del panel de Railway." 
    });
  } catch (error: any) {
    console.error('Error creando las tablas:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}