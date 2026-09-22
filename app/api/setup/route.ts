import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`DROP TABLE IF EXISTS water_log CASCADE;`);
    await pool.query(`
      CREATE TABLE water_log (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        glasses INT DEFAULT 0,
        log_date DATE DEFAULT CURRENT_DATE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fasting_state (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_fasting BOOLEAN DEFAULT FALSE,
        start_time TIMESTAMP,
        target_hours INT DEFAULT 16
      );
    `);

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

    // NUEVO: Tabla de Estado de Ánimo
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mood_log (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        mood_score INT NOT NULL,
        energy_level INT NOT NULL,
        symptoms TEXT,
        log_date DATE DEFAULT CURRENT_DATE,
        UNIQUE(email, log_date)
      );
    `);

    return NextResponse.json({ 
      success: true, 
      message: "¡Base de datos actualizada con el módulo de Estado de Ánimo!" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
