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

    // Limpiar y reinsertar los tips de coaching
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

    // 8. Tabla de Recetas y Planificador de Menús (Ampliada)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS food_recipes (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL, 
        title VARCHAR(150) NOT NULL,
        macros VARCHAR(100) NOT NULL, 
        impact VARCHAR(100) NOT NULL, 
        icon VARCHAR(10) NOT NULL,    
        description TEXT NOT NULL,
        diet_type VARCHAR(50) DEFAULT 'general'
      );
    `);

    // Limpiar y reinsertar un recetario amplio y variado
    await pool.query(`DELETE FROM food_recipes;`);
    await pool.query(`
      INSERT INTO food_recipes (category, title, macros, impact, icon, description, diet_type) 
      VALUES 
      -- Opciones para Romper el Ayuno
      ('romper_ayuno', 'Omelette de Espinaca y Palta', 'Grasas saludables y Proteína', 'Bajo impacto insulínico', '🍳', 'Evita el pico de azúcar en sangre. Los huevos aportan proteína de alta calidad para mantener la masa muscular, y la palta grasas que prolongan la saciedad por horas.', 'general'),
      ('romper_ayuno', 'Caldo de Huesos Nutritivo', 'Colágeno y Minerales', 'Reparación intestinal', '🍲', 'Perfecto si hiciste un ayuno profundo. Prepara tu sistema digestivo de forma muy suave, repone los electrolitos perdidos y ayuda a sellar la pared intestinal.', 'general'),
      ('romper_ayuno', 'Yogur Griego Entero con Nueces y Canela', 'Probióticos y Grasas', 'Digestión ligera', '🥣', 'Opción rica en probióticos naturales. Las nueces añaden grasas omega-3 y la canela ayuda a regular de forma natural la glucosa en sangre.', 'cetogenica'),
      ('romper_ayuno', 'Batido Verde Keto (Espinaca, Apio y Chía)', 'Fibra y Antioxidantes', 'Cero pico glucémico', '🥤', 'Ideal para una transición suave. Aporta micronutrientes esenciales y semillas de chía que forman un gel protector en el tracto digestivo.', 'detox'),
      ('romper_ayuno', 'Huevos Revueltos con Aceite de Coco y Tomates Cherry', 'Proteínas y Licopeno', 'Estabilizador hormonal', '🍅', 'Una alternativa rápida, rica en grasas de cadena media que estimulan la energía celular sin interrumpir el estado de bienestar.', 'general'),
      ('romper_ayuno', 'Pudín de Chía con Leche de Almendras', 'Omega-3 y Fibra Soluble', 'Protección gástrica', '🌰', 'Semillas de chía hidratadas desde la noche anterior con leche vegetal sin azúcar, perfectas para un despertar digestivo calmado.', 'vegano'),
      ('romper_ayuno', 'Aguacate Relleno con Atún al Limón', 'Grasas y Proteína Marina', 'Saciedad prolongada', '🥑', 'Una combinación excelente de grasas monoinsaturadas y proteína limpia que no genera picos de glucosa.', 'general'),

      -- Opciones para Comida Principal
      ('comida_principal', 'Pollo al Horno con Vegetales Fibrosos', 'Alta Proteína y Fibra', 'Nutrición completa', '🥗', 'Una excelente opción para la mitad de tu ventana de alimentación. La fibra de los vegetales (brócoli, espárragos) ralentiza la absorción de los nutrientes.', 'general'),
      ('comida_principal', 'Salmón a la Plancha con Espárragos y Aceite de Oliva', 'Omega-3 y Proteína Limpia', 'Salud cardiovascular y cerebral', '🐟', 'Rico en ácidos grasos esenciales que reducen la inflamación sistémica y mantienen la saciedad durante las horas de ayuno posteriores.', 'keto'),
      ('comida_principal', 'Carne Magra Salteada con Pimientos y Cebolla', 'Proteína de Alta Biodisponibilidad', 'Energía sostenida', '🥩', 'Aporte importante de hierro y zinc, acompañado de pimientos ricos en vitamina C que potencian la absorción de nutrientes.', 'general'),
      ('comida_principal', 'Pechuga de Pavo en Salsa de Champignones', 'Bajo en Grasas y Alto en Proteínas', 'Control calórico', '🍄', 'Una comida saciante, ligera para el metabolismo y con un perfil de aminoácidos completo ideal para conservar masa muscular.', 'general'),
      ('comida_principal', 'Ensalada Completa de Atún, Huevo Duro y Aceitunas', 'Proteínas, Grasas y Minerales', 'Refrescante y saciante', '🐟', 'Práctica y veloz. El atún y el huevo cubren tus requerimientos proteicos, mientras las aceitunas aportan sodio saludable y grasas monoinsaturadas.', 'general'),
      ('comida_principal', 'Wok de Tofu y Brócoli con Jengibre', 'Proteína Vegetal y Fitonutrientes', 'Desintoxicación hepática', '🥦', 'Excelente opción basada en plantas dentro de la ventana de alimentación, condimentada con jengibre para activar la digestión.', 'vegano'),
      ('comida_principal', 'Bife de Chorizo Magro con Ensalada de Rúcula y Parmesano', 'Alta Proteína y Grasas', 'Nutrición densa', '🥩', 'Corte magro de carne vacuna acompañado de hojas verdes oscuras y escamas de queso parmesano estacionado.', 'general'),
      ('comida_principal', 'Merluza al Horno con Costra de Hierbas y Puré de Coliflor', 'Proteína Blanca y Bajo Carbohidrato', 'Digestión liviana', '🍽️', 'Pescado blanco de mar horneado con especias finas y acompañado de un puré cremoso de coliflor en lugar de patata.', 'general')
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
      message: '¡Base de datos inicializada con éxito y recetario completo cargado!' 
    });
  } catch (error: any) {
    console.error('Error inicializando BD:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
