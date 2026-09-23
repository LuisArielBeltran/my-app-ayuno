export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Asegurar tabla de alimentos
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

    // Limpiar o verificar si ya tiene datos para actualizar/completar
    const foodCheck = await pool.query('SELECT COUNT(*) FROM food_database');
    if (parseInt(foodCheck.rows[0].count) < 10) {
      await pool.query(`
        INSERT INTO food_database (food_name, breaks_fast, category, explanation, synonyms) VALUES
        -- Bebidas y Regionales
        ('Agua', false, 'Bebidas', 'Hidrata sin generar ninguna respuesta de insulina. Es la base de cualquier ayuno.', 'agua mineral, agua de la canilla, agua purificada'),
        ('Mate amargo / Cimarrón', false, 'Infusiones', 'Permitido. Las hojas de yerba mate sin azúcar ni miel no elevan la glucosa y aportan antioxidantes.', 'mate, cimarrón, amargo, mate solo'),
        ('Mate dulce / con azúcar o miel', true, 'Infusiones', 'Rompe el ayuno de inmediato debido al contenido de azúcar o miel.', 'mate dulce, mate con azúcar'),
        ('Tereré', false, 'Infusiones', 'Infusión fría de yerba mate con agua y hielo (sin jugos en polvo ni azúcar).', 'tereré'),
        ('Café negro / Espresso / Café solo', false, 'Bebidas', 'Permitido. Estimula la autofagia y no interrumpe el ayuno metabólico.', 'café, café negro, espresso, café americano'),
        ('Café con leche / Cortado / Lágrima', true, 'Bebidas', 'Rompe el ayuno por la lactosa y proteínas de la leche.', 'café con leche, cortado, lágrima, café con cortadito'),
        ('Té verde / Té negro / Infusiones de hierbas (sin azúcar)', false, 'Infusiones', 'Permitidas (manzanilla, boldo, cedrón, menta). No generan respuesta glucémica.', 'té, manzanilla, té verde, té negro, infusión, cocido'),
        ('Mate cocido', false, 'Infusiones', 'Infusión de yerba mate pura sin azúcar.', 'mate cocido'),
        
        -- Endulzantes y Azúcares
        ('Stevia pura / Eritritol / Alulosa', false, 'Endulzantes', 'Endulzantes no calóricos que no afectan significativamente la glucosa en la mayoría de las personas.', 'stevia, eritritol, alulosa, monk fruit'),
        ('Azúcar blanca / Morena / Mascabado', true, 'Endulzantes', 'Eleva drásticamente la insulina, rompiendo el ayuno por completo.', 'azúcar, azúcar blanca, azúcar morena, azúcar mascabado'),
        ('Panela / Piloncillo / Chancaca / Papelón', true, 'Endulzantes', 'Azúcar de caña sin refinar. Rompe el ayuno de forma absoluta.', 'panela, piloncillo, chancaca, papelón, raspadura'),
        ('Miel / Algarroba / Sirope', true, 'Endulzantes', 'Ricos en fructosa y glucosa, activan el metabolismo y cortan el ayuno.', 'miel, miel de abeja, algarroba, melaza, sirope'),

        -- Lácteos y Grasas
        ('Leche (entera, descremada, vegetal)', true, 'Lácteos', 'Aporta macronutrientes que activan la digestión y la insulina.', 'leche, leche entera, leche descremada, leche de almendras, leche de soja'),
        ('Manteca / Mantequilla', true, 'Grasas', 'Aunque se usa en café keto (ayuno graso), técnicamente activa la digestión. Para ayuno limpio, rompe.', 'manteca, mantequilla'),
        ('Crema de leche / Nata', true, 'Grasas', 'Contiene calorías y grasas que inician el proceso digestivo.', 'crema de leche, nata'),
        
        -- Jugos y Frutas
        ('Jugo de fruta / Zumo / Licuado', true, 'Frutas', 'La fructosa libre entra directo al torrente sanguíneo cortando el ayuno y elevando la insulina.', 'jugo, zumo, licuado, exprimido, jugo de naranja'),
        
        -- Extras
        ('Vinagre de manzana (diluido en agua)', false, 'Suplementos', 'Ayuda a regular la glucosa en sangre y no rompe el ayuno si se consume diluido.', 'vinagre de manzana, ACV'),
        ('Caldo de huesos (Bone broth)', true, 'Alimentos', 'Contiene aminoácidos y colágeno. En ayuno estricto estricto de agua rompe; en ayuno metabólico flexible se usa con moderación, pero cuenta con calorías.', 'caldo, caldo de huesos, consomé')
      ON CONFLICT DO NOTHING;
    `);
  } catch (error) {
    console.error('Error seeding food DB:', error);
  }

  return NextResponse.json({ success: true, message: '¡Base de datos de alimentos latinoamericanos actualizada!' });
}
