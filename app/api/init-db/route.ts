export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
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

    // 3. Tabla de Base de Alimentos (¿Rompe el ayuno?)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS food_database (
        id SERIAL PRIMARY KEY,
        food_name VARCHAR(150) NOT NULL,
        breaks_fast BOOLEAN NOT NULL,
        category VARCHAR(50),
        explanation TEXT
      );
    `);

    // 4. Tabla de Cápsulas de Coaching y Fases Metabólicas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coaching_tips (
        id SERIAL PRIMARY KEY,
        phase_hours INT NOT NULL, -- Hora en la que se activa el tip (ej: 4, 12, 16)
        goal VARCHAR(255),        -- Objetivo al que aplica (o 'general')
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL
      );
    `);

    // 5. Tabla de Hidratación
    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_log (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        glasses INT DEFAULT 0,
        log_date DATE DEFAULT CURRENT_DATE
      );
    `);

    // 6. Tabla de Estado de Ayuno
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fasting_state (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_fasting BOOLEAN DEFAULT FALSE,
        start_time TIMESTAMP,
        target_hours INT DEFAULT 16
      );
    `);

    // --- INSERCIÓN DE DATOS INICIALES (SEEDS) ---

    // Insertar alimentos de prueba si la tabla está vacía
    const foodCheck = await pool.query('SELECT COUNT(*) FROM food_database');
    if (parseInt(foodCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO food_database (food_name, breaks_fast, category, explanation) VALUES
        ('Agua', false, 'Bebidas', 'Hidrata sin generar ninguna respuesta de insulina.'),
        ('Café negro sin azúcar', false, 'Bebidas', 'Permitido. Los antioxidantes apoyan la autofagia y no elevan la glucosa.'),
        ('Café con leche', true, 'Bebidas', 'Rompe el ayuno debido a las proteínas y lactosa de la leche.'),
        ('Edulcorante artificial (Stevia pura)', false, 'Suplementos', 'Generalmente seguro en pequeñas cantidades, no altera la glucosa en la mayoría de las personas.'),
        ('Jugo de fruta natural', true, 'Bebidas', 'Rompe el ayuno de inmediato por su alta carga de fructosa líquida.');
      `);
    }

    // Insertar cápsulas de coaching metabólico iniciales
    const tipsCheck = await pool.query('SELECT COUNT(*) FROM coaching_tips');
    if (parseInt(tipsCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO coaching_tips (phase_hours, goal, title, content) VALUES
        (4, 'general', 'Fin de la digestión', 'Tus niveles de insulina comienzan a descender. El cuerpo empieza a utilizar la energía de tu última comida.'),
        (12, 'Bajar peso y mantenerme', 'Quema ligera de grasa', 'Tus reservas de glucógeno hepatico se están agotando. El organismo empieza a mirar hacia las grasas almacenadas como combustible.'),
        (16, 'general', 'Zona de Cetosis y Autofagia', '¡Meta alcanzada! Aquí es donde ocurre la magia de la limpieza celular y la máxima optimización metabólica.');
      `);
    }

    return NextResponse.json({ 
      success: true, 
      message: '¡Base de datos estructurada y poblada con contenido inicial exitosamente!' 
    });
  } catch (error: any) {
    console.error('Error inicializando BD:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
