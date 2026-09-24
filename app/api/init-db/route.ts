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

    // 2. Tabla de Métricas del Usuario (Ampliada con perfiles de dieta, tracks y horarios)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        goal VARCHAR(255),
        gender VARCHAR(50),
        height_cm NUMERIC,
        weight_kg NUMERIC,
        target_weight_kg NUMERIC,
        diet_type VARCHAR(50) DEFAULT 'omnivore',
        track_type VARCHAR(50) DEFAULT 'fat_loss',
        first_meal_time VARCHAR(20) DEFAULT '09:00',
        last_meal_time VARCHAR(20) DEFAULT '22:00',
        speed_level VARCHAR(50) DEFAULT 'normal',
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Asegurar compatibilidad y columnas nuevas si la tabla ya existía
    await pool.query(`
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS diet_type VARCHAR(50) DEFAULT 'omnivore';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS track_type VARCHAR(50) DEFAULT 'fat_loss';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS first_meal_time VARCHAR(20) DEFAULT '09:00';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS last_meal_time VARCHAR(20) DEFAULT '22:00';
      ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS speed_level VARCHAR(50) DEFAULT 'normal';
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

    await pool.query(`
      ALTER TABLE food_database ADD COLUMN IF NOT EXISTS synonyms TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS food_database_name_idx ON food_database (food_name);
    `);

    // Limpiar duplicados de alimentos
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

    await pool.query(`DELETE FROM coaching_tips;`);
    await pool.query(`
      INSERT INTO coaching_tips (phase_hours, goal, title, content) VALUES
      (0, 'general', 'Inicio del Ayuno', 'Tu cuerpo comienza a procesar la última comida. Los niveles de glucosa e insulina se estabilizan.'),
      (4, 'general', 'Fin de la digestión', 'Tus niveles de insulina comienzan a descender. El cuerpo empieza a utilizar la energía de tu última comida.'),
      (12, 'general', 'Quema ligera de grasa', 'Tus reservas de glucógeno hepático se están agotando. El organismo empieza a mirar hacia las grasas almacenadas como combustible.'),
      (16, 'general', 'Zona de Cetosis y Autofagia', '¡Meta alcanzada! Aquí es donde ocurre la magia de la limpieza celular y la máxima optimización metabólica.');
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

    // 7. Tabla de Historial de Peso y Metas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weight_logs (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        weight_kg NUMERIC NOT NULL,
        log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Tabla de Recetas (Protegiendo columnas de macros con valores por defecto)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        icon_symbol VARCHAR(10) NOT NULL,
        prep_time INT NOT NULL,
        calories INT NOT NULL,
        protein_g NUMERIC DEFAULT 15,
        carbs_g NUMERIC DEFAULT 20,
        fat_g NUMERIC DEFAULT 10,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL
      );
    `);

    await pool.query(`
      ALTER TABLE recipes ADD COLUMN IF NOT EXISTS protein_g NUMERIC DEFAULT 15;
      ALTER TABLE recipes ADD COLUMN IF NOT EXISTS carbs_g NUMERIC DEFAULT 20;
      ALTER TABLE recipes ADD COLUMN IF NOT EXISTS fat_g NUMERIC DEFAULT 10;
    `);

    await pool.query(`DELETE FROM recipes;`);
    await pool.query(`
      INSERT INTO recipes (title, category, icon_symbol, prep_time, calories, protein_g, carbs_g, fat_g, ingredients, instructions) 
      VALUES 
      ('Omelette de Espinaca y Palta', 'Romper Ayuno', '🍳', 10, 320, 18, 5, 24, '2 huevos orgánicos, 1 taza de espinacas frescas, 1/2 palta (aguacate), sal y pimienta.', 'Batir los huevos. Saltear las espinacas en una sartén con unas gotas de aceite de oliva hasta que reduzcan, verter los huevos y cocinar doblando en forma de omelette. Servir con la palta en rodajas.'),
      ('Caldo de Huesos Reparador', 'Romper Ayuno', '🍲', 15, 95, 12, 2, 4, '500ml de caldo de huesos concentrado, una pizca de sal marina, jengibre fresco rallado.', 'Calentar el caldo de huesos a fuego lento en una olla. Añadir el jengibre rallado para estimular la digestión de forma suave. Consumir tibio.'),
      ('Yogur Griego con Nueces y Canela', 'Romper Ayuno', '🥣', 5, 210, 20, 12, 8, '1 taza de yogur griego entero sin azúcar, 15g de nueces picadas, pizca de canela en polvo.', 'Colocar el yogur en un bol, esparcir las nueces por encima y terminar con una pizca generosa de canela para regular la glucosa.'),
      ('Batido Verde de Transición', 'Romper Ayuno', '🥤', 7, 150, 8, 18, 3, '1 puñado de espinaca, 1/2 pepino, jugo de medio limón, 1 cucharadita de semillas de chía, agua.', 'Licuar todos los ingredientes hasta obtener una mezcla homogénea y ligera que prepare el sistema digestivo sin picos de insulina.'),
      ('Huevos Revueltos con Tomates Cherry', 'Romper Ayuno', '🍅', 10, 280, 16, 6, 20, '2 huevos, 5 tomates cherry cortados a la mitad, aceite de coco, albahaca fresca.', 'Saltear los tomates cherry en aceite de coco hasta que estén tiernos. Agregar los huevos batidos y remover suavemente hasta lograr una textura cremosa.'),
      ('Pudín de Chía Proteico', 'Romper Ayuno', '🌰', 5, 190, 10, 15, 9, '3 cucharadas de semillas de chía, 1 taza de leche de almendras sin azúcar, esencia de vainilla.', 'Mezclar la chía con la leche vegetal desde la noche anterior. Servir frío con unas gotas de vainilla para un despertar digestivo ideal.'),
      ('Pollo al Horno con Brócoli y Oliva', 'Comida Principal', '🥗', 25, 420, 38, 10, 14, '1 pechuga de pollo, 1 taza de brócoli en floretes, 1 cucharada de aceite de oliva, ajo en polvo.', 'Marinar el pollo con especias y hornear a 180°C durante 20 minutos junto con el brócoli previamente rociado con aceite de oliva y sal.'),
      ('Salmón a la Plancha con Espárragos', 'Comida Principal', '🐟', 18, 480, 34, 6, 28, '1 filete de salmón, 1 atado de espárragos frescos, jugo de limón, aceite de oliva.', 'Sellar el salmón a la plancha con la piel hacia abajo hasta que quede crujiente. Saltear los espárragos en la misma sartén con un toque de limón.'),
      ('Carne Magra Salteada con Pimientos', 'Comida Principal', '🥩', 20, 450, 40, 12, 18, '150g de corte magro de carne vacuna, 1 pimiento rojo en tiras, cebolla, salsa de soja baja en sodio.', 'Saltear the carne en tiras a fuego vivo con la cebolla y los pimientos. Añadir un chorrito de salsa de soja al final para realzar el sabor.'),
      ('Pechuga de Pavo con Champignones', 'Comida Principal', '🍄', 22, 380, 35, 8, 12, '150g de pechuga de pavo, 1 taza de champignones laminados, caldo de verduras, hierbas finas.', 'Dorar la pechuga, incorporar los champignones y cocinar a fuego lento con un poco de caldo hasta reducir.'),
      ('Ensalada Completa de Atún y Huevo', 'Comida Principal', '🥗', 10, 390, 32, 8, 22, '1 lata de atún al agua, 1 huevo duro, hojas de lechuga, aceitunas negras, aceite de oliva virgen extra.', 'Armar una base de lechuga fresca, incorporar el atún escurrido, el huevo duro en gajitos y las aceitunas. Aderezar con aceite de oliva y vinagre.'),
      ('Wok Vegetal con Tofu', 'Comida Principal', '🥦', 15, 340, 22, 25, 14, '100g de tofu firme en cubos, mix de vegetales (zucchini, zanahoria, brotes de soja), jengibre, aceite de sésamo.', 'Saltear the tofu en cubos hasta que dore. Retirar, saltear los vegetales crujientes con jengibre rallado y reincorporar el tofu al final.')
    `);

    // 9. Tablas de Gamificación e Insignias
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

    // --- SEED DE ALIMENTOS ---
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
      ['Panela / Piloncillo / Chancaca / Papelón', true, 'Endulzantes', 'Azúcar de caña sin refinar. Rompe el ayuno de absoluto.', 'panela, piloncillo, chancaca, papelón, raspadura'],
      ['Miel / Algarroba / Sirope', true, 'Endulzantes', 'Ricos en fructosa y glucosa, activan el metabolismo y cortan el ayuno.', 'miel, miel de abeja, algarroba, melaza, sirope'],
      ['Leche (entera, descremada, vegetal)', true, 'Lácteos', 'Aporta macronutrientes que activan la digestión y la insulina.', 'leche, leche entera, leche descremada, leche de almendras, leche de soja'],
      ['Manteca / Mantequilla', true, 'Grasas', 'Aunque se usa en café keto (ayuno graso), técnicamente activa la digestión. Para ayuno limpio, rompe.', 'manteca, mantequilla'],
      ['Crema de leche / Nata', true, 'Grasas', 'Contiene calorías y grasas que inician el proceso digestivo.', 'crema de leche, nata'],
      ['Jugo de fruta / Zumo / Licuado', true, 'Frutas', 'La fructosa libre entra directo al torrente sanguíneo cortando el ayuno y elevando la insulina.', 'jugo, zumo, licuado, exprimido, jugo de naranja'],
      ['Vinagre de manzana (diluido en agua)', false, 'Suplementos', 'Ayuda a regular la glucosa en sangre y no rompe el ayuno si se consume diluido.', 'vinagre de manzana, ACV'],
      ['Caldo de huesos (Bone broth)', true, 'Alimentos', 'Contiene aminoácidos y colágeno. En ayuno estricto de agua rompe; en ayuno metabólico flexible se usa con moderación.', 'caldo, caldo de huesos, consomé']
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
      message: '¡Base de datos inicializada perfectamente con soporte de zona horaria y macronutrientes asegurados!' 
    });
  } catch (error: any) {
    console.error('Error inicializando BD:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
