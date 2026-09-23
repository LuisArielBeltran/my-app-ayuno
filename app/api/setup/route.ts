export const dynamic = 'force-dynamic'; // <--- ESTO DESTRUYE EL CACHÉ

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

    await pool.query(`DROP TABLE IF EXISTS users CASCADE;`);
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        protocol VARCHAR(50) DEFAULT '16/8',
        message TEXT NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS learning_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        read_time INT NOT NULL,
        category VARCHAR(50) NOT NULL
      );
    `);

    return NextResponse.json({ 
      success: true, 
      message: "¡Base de datos actualizada con TODOS los módulos!" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
