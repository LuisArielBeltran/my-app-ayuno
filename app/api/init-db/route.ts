export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 1. Tabla de Usuarios (Actualizada con timezone)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        timezone TEXT DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Asegurar compatibilidad si la tabla ya existía
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
    `);

    // 2. Tabla de Métricas del Usuario (Ampliada con edad, perfiles de dieta, tracks, método de peso, horarios y actividad)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        goal VARCHAR(255),
        gender VARCHAR(50),
        age VARCHAR(50),
        height_cm NUMERIC,
        weight_kg NUMERIC,
        target_weight_kg NUMERIC,
        diet_type VARCHAR(50) DEFAULT 'omnivore',
        track_type VARCHAR(50) DEFAULT 'fat_loss',
        weight_loss_method VARCHAR(50) DEFAULT 'fasting',
        first_meal_time VARCHAR(20) DEFAULT '09:00',
        last_meal_time VARCHAR(20) DEFAULT '22:00',
        speed_level VARCHAR(50) DEFAULT 'normal',
        has_activity BOOLEAN,
        activity_type VARCHAR(100),
        activity_other VARCHAR(255),
        activity_hours VARCHAR(50),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Asegurar compatibilidad y columnas nuevas si la tabla ya existía
    await pool.query(`
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS age VARCHAR(50);
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS diet_type VARCHAR(50) DEFAULT 'omnivore';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS track_type VARCHAR(50) DEFAULT 'fat_loss';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS weight_loss_method VARCHAR(50) DEFAULT 'fasting';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS first_meal_time VARCHAR(20) DEFAULT '09:00';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS last_meal_time VARCHAR(20) DEFAULT '22:00';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS speed_level VARCHAR(50) DEFAULT 'normal';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS has_activity BOOLEAN;
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS activity_type VARCHAR(100);
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS activity_other VARCHAR(255);
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS activity_hours VARCHAR(50);
    `);

    // 3. Tabla de Cápsulas de Coaching
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coaching_tips (
        id SERIAL PRIMARY KEY,
        phase_hours INT NOT NULL,
        goal VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL
      );
    `);

    await pool.query(`DELETE FROM coaching_tips;`);
    await pool.query(`
      INSERT INTO coaching_tips (phase_hours, goal, title, content) VALUES
      (0, 'general', 'Inicio del Ayuno', 'Tu cuerpo comienza a procesar la última comida. Los niveles de glucosa e insulina se estabilizan.'),
      (4, 'general', 'Fin de la digestión', 'Tus niveles de insulina comienzan a descender. El cuerpo empieza a utilizar la energía de tu última comida.'),
      (12, 'general', 'Quema ligera de grasa', 'Tus reservas de glucógeno hepático se están agotando. El organismo empieza a mirar hacia las grasas almacenadas como combustible.'),
      (16, 'general', 'Zona de Cetosis y Autofagia', '¡Meta alcanzada! Aquí es donde ocurre la magia de la limpieza celular y la máxima optimización metabólica.');
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

    // 6. Tabla de Historial de Peso y Metas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weight_logs (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        weight_kg NUMERIC NOT NULL,
        log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Tabla de Suscripciones Push para las Notificaciones Insistentes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        subscription JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 8. Tablas de Gamificación e Insignias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        badge_code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(10) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_code VARCHAR(50) NOT NULL,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_code)
      );
    `);

    // Seed de Insignias iniciales
    await pool.query(`
      INSERT INTO badges (badge_code, title, description, icon) VALUES
      ('first_fast', 'Primer Ayuno', 'Completa tu primer ciclo de ayuno intermitente.', '⏱️'),
      ('streak_7', 'Racha de Fuego', 'Mantén una constancia de ayuno durante 7 días seguidos.', '🔥'),
      ('water_master', 'Maestro del Hidrógeno', 'Registra tus 8 vasos de agua diarios recomendados.', '💧'),
      ('goal_reached', 'Misión Cumplida', 'Alcanza tu peso objetivo establecido en el plan.', '🏆')
      ON CONFLICT (badge_code) DO NOTHING;
    `);

    return NextResponse.json({ 
      success: true, 
      message: '¡Base de datos optimizada y limpia! Tablas innecesarias removidas correctamente.' 
    });
  } catch (error: any) {
    console.error('Error inicializando BD:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
