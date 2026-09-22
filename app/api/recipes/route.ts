import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const defaultRecipes = [
  {
    title: 'Omelette Digestivo de Espinaca y Palta',
    category: 'Rompe Ayuno',
    prep_time: 10,
    calories: 320,
    protein_g: 18,
    carbs_g: 4,
    fat_g: 26,
    ingredients: '2 huevos orgánicos, 1/2 palta / aguacate, 1 puñado de espinacas frescas, 1 cda de aceite de oliva virgen extra, pizca de sal marina.',
    instructions: '1. Batir los huevos con la sal.\n2. Saltear la espinaca en el aceite de oliva a fuego medio.\n3. Verter los huevos y cocinar hasta cuajar.\n4. Servir con la palta laminada encima.',
    icon_symbol: '🥑'
  },
  {
    title: 'Caldo Reparador con Pollo Desmenuzado',
    category: 'Rompe Ayuno',
    prep_time: 15,
    calories: 210,
    protein_g: 28,
    carbs_g: 2,
    fat_g: 10,
    ingredients: '250ml de caldo de hueso, 80g de pechuga de pollo cocida, cilantro fresco, unas gotas de limón.',
    instructions: '1. Calentar el caldo de hueso a fuego lento.\n2. Desmenuzar el pollo y agregarlo al caldo.\n3. Aromatizar con cilantro y unas gotas de limón antes de consumir.',
    icon_symbol: '🍲'
  },
  {
    title: 'Bowl Cetogénico de Salmón y Pepino',
    category: 'Keto',
    prep_time: 12,
    calories: 450,
    protein_g: 32,
    carbs_g: 5,
    fat_g: 34,
    ingredients: '150g de salmón a la plancha, 1/2 pepino en rodajas, 1 cda de semillas de sésamo, 1 cda de aceite de sésamo o oliva.',
    instructions: '1. Cocinar el salmón a la plancha durante 4 minutos por lado.\n2. Cortar el pepino en rodajas finas.\n3. Montar en un bowl, aderezar con el aceite y espolvorear el sésamo.',
    icon_symbol: '🥗'
  },
  {
    title: 'Batido Verde Desintoxicante (Bajo Glucémico)',
    category: 'Desintoxicante',
    prep_time: 5,
    calories: 140,
    protein_g: 4,
    carbs_g: 12,
    fat_g: 9,
    ingredients: '1 vaso de leche de almendras sin azúcar, 1/2 pepino, 1 puñado de espinaca, 1 cda de semillas de chía, jugo de 1/2 limón.',
    instructions: '1. Colocar todos los ingredientes en la licuadora.\n2. Procesar durante 60 segundos hasta obtener una mezcla homogénea.\n3. Beber inmediatamente.',
    icon_symbol: '🥤'
  }
];

export async function GET() {
  try {
    let result = await pool.query('SELECT * FROM recipes ORDER BY id ASC');

    // Auto-poblar si la tabla está vacía
    if (result.rows.length === 0) {
      for (const r of defaultRecipes) {
        await pool.query(
          `INSERT INTO recipes (title, category, prep_time, calories, protein_g, carbs_g, fat_g, ingredients, instructions, icon_symbol)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [r.title, r.category, r.prep_time, r.calories, r.protein_g, r.carbs_g, r.fat_g, r.ingredients, r.instructions, r.icon_symbol]
        );
      }
      result = await pool.query('SELECT * FROM recipes ORDER BY id ASC');
    }

    return NextResponse.json({ recipes: result.rows });
  } catch (error: any) {
    console.error('Error al obtener recetas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}