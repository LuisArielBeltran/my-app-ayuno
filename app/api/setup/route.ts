import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 1. Usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Agua
    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_log (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        glasses INT DEFAULT 0,
        log_date DATE DEFAULT CURRENT_DATE
      );
    `);

    // 3. Ayuno
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fasting_state (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_fasting BOOLEAN DEFAULT FALSE,
        start_time TIMESTAMP,
        target_hours INT DEFAULT 16
      );
    `);

    // 4. NUEVO: Tabla de Recetas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        prep_time INT NOT NULL,
        calories INT NOT NULL,
        protein_g INT NOT NULL,
        carbs_g INT NOT NULL,
        fat_g INT NOT NULL,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        icon_symbol VARCHAR(10) DEFAULT '🥗'
      );
    `);

    // 5. NUEVO: Registro de Comidas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meal_log (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        meal_name VARCHAR(150) NOT NULL,
        calories INT DEFAULT 0,
        log_date DATE DEFAULT CURRENT_DATE,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return NextResponse.json({ 
      success: true, 
      message: "¡Estructura de la base de datos Full actualizada con éxito!" 
    });
  } catch (error: any) {
    console.error('Error creando tablas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
