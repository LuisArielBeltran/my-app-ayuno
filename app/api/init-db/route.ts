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

    // 2. Tabla de Métricas del Usuario
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

    // 3. Tabla de Base de Alimentos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS food_database (
        id SERIAL PRIMARY KEY,
        food_name VARCHAR(150) NOT NULL,
        breaks_fast BOOLEAN NOT NULL,
        category VARCHAR(50),
        explanation TEXT,
        synonyms TEXT
      );
    `);

    // Asegurar columna synonyms e índice único para food_name
    await pool.query(`
      ALTER TABLE food_database ADD COLUMN IF NOT EXISTS synonyms TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS food_database_name_idx ON food_database (food_name);
    `);

    // Limpiar posibles duplicados anteriores en Railway
    await pool.query(`
      DELETE FROM food_database a USING food_database b 
      WHERE a.id > b.id AND a.food_name = b.food_name;
    `);

    // 4. Tabla de Cápsulas de Coaching
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coaching_tips (
        id SERIAL PRIMARY KEY,
        phase_hours INT NOT NULL,
        goal VARCHAR(255),
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

    // --- SEED DE ALIMENTOS LATINOAMERICANOS ---
    const foods = [
      ['Agua', false, 'Bebidas', 'Hidrata sin generar ninguna respuesta de insulina. Es la base de cualquier ayuno.', 'agua mineral, agua de la canilla, agua purificada'],
      ['Mate amargo / Cimarrón', false, 'Infusiones', 'Permitido. Las hojas de yerba mate sin azúcar ni miel no elevan la glucosa y aportan antioxidantes.', 'mate, cimarrón, amargo, mate solo'],
      ['Mate dulce / con azúcar o miel', true, 'Infusiones', 'Rompe el ayuno de inmediato debido al contenido de azúcar o miel.', 'mate dulce, mate con azúcar'],
      ['Tereré', false, 'Infusiones', 'Infusión fría de yerba mate con agua y hielo (sin jugos en polvo ni azúcar).', 'tereré'],
      ['Café negro / Espresso / Café solo', false, 'Bebidas', 'Permitido. Estimula la autofagia y no interrumpe el ayuno metabólico.', 'café, café negro, espresso, café americano'],
      ['Café con leche / Cortado / Lágrima', true, 'Bebidas', 'Rompe el ayuno por la lactosa y proteínas de la leche.', 'café con leche, cortado, lágrima, café con cortadito'],
      ['Té verde / Té negro / Infusiones de hierbas (sin azúcar)', false, 'Infusiones', 'Permitidas (manzanilla, boldo, cedrón, menta). No generan respuesta glucémica.', 'té, manzanilla, té verde, té negro, infusión, cocido'],
      ['Mate cocido', false, 'Infusiones', 'Infusión de yerba mate pura sin azúcar.', 'mate cocido'],
      ['Stevia pura / Eritritol / Alulosa', false, 'Endulzantes', 'Endulzantes no calóricos que no afectan significativamente la glucosa en la mayoría de las personas.', 'stevia, eritritol, alulosa, monk fruit'],
      ['Azúcar blanca / Morena / Mascabado', true, 'Endulzantes', 'Eleva drásticamente la insulina, rompiendo el ayuno por completo.', 'azúcar, azúcar blanca, azúcar morena, azúcar mascabado'],
      ['Panela / Piloncillo / Chancaca / Papelón', true, 'Endulzantes', 'Azúcar de caña sin refinar. Rompe el ayuno de forma absoluta.', 'panela, piloncillo, chancaca, papelón, raspadura'],
      ['Miel / Algarroba / Sirope', true, 'Endulzantes', 'Ricos en fructosa y glucosa, activan el metabolismo y cortan el ayuno.', 'miel, miel de abeja, algarroba, melaza, sirope'],
      ['Leche (entera, descremada, vegetal)', true, 'Lácteos', 'Aporta macronutrientes que activan la digestión y la insulina.', 'leche, leche entera, leche descremada, leche de almendras, leche de soja'],
      ['Manteca / Mantequilla', true, 'Grasas', 'Aunque se usa en café keto (ayuno graso), técnicamente activa la digestión. Para ayuno limpio, rompe.', 'manteca, mantequilla'],
      ['Crema de leche / Nata', true, 'Grasas', 'Contiene calorías y grasas que inician el proceso digestivo.', 'crema de leche, nata'],
      ['Jugo de fruta / Zumo / Licuado', true, 'Frutas', 'La fructosa libre entra directo al torrente sanguíneo cortando el ayuno y elevando la insulina.', 'jugo, zumo, licuado, exprimido, jugo de naranja'],
      ['Vinagre de manzana (diluido en agua)', false, 'Suplementos', 'Ayuda a regular la glucosa en sangre y no rompe el ayuno si se consume diluido.', 'vinagre de manzana, ACV'],
      ['Caldo de huesos (Bone broth)', true, 'Alimentos', 'Contiene aminoácidos y colágeno. En ayuno estricto de agua rompe; en ayuno metabólico flexible se usa con moderación, pero cuenta con calorías.', 'caldo, caldo de huesos, consomé']
    ];

    for (const food of foods) {
      await pool.query(`
        INSERT INTO food_database (food_name, breaks_fast, category, explanation, synonyms)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (food_name) DO UPDATE 
        SET breaks_fast = EXCLUDED.breaks_fast, explanation = EXCLUDED.explanation, synonyms = EXCLUDED.synonyms;
      `, food);
    }

    return NextResponse.json({ 
      success: true, 
      message: '¡Índice único creado y base de datos poblada exitosamente!' 
    });
  } catch (error: any) {
    console.error('Error inicializando BD:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
