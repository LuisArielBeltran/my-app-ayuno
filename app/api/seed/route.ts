// app/api/seed/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const initialFoods = [
  { name: 'Café negro sin azúcar', breaksFast: false, category: 'Bebidas', explanation: 'No eleva la insulina ni contiene calorías significativas.' },
  { name: 'Agua mineral con gas', breaksFast: false, category: 'Bebidas', explanation: 'Cero calorías, ideal para mantener la hidratación.' },
  { name: 'Té verde o negro', breaksFast: false, category: 'Bebidas', explanation: 'Promueve la autofagia y no rompe el ayuno.' },
  { name: 'Agua con limón (unas gotas)', breaksFast: false, category: 'Bebidas', explanation: 'No interrumpe el estado de cetosis ni la autofagia.' },
  { name: 'Mate amargo', breaksFast: false, category: 'Bebidas', explanation: 'Permitido en el ayuno si no se le añade azúcar ni edulcorantes.' },
  { name: 'Manzana verde', breaksFast: true, category: 'Frutas', explanation: 'Contiene fructosa y carbohidratos que elevan la glucosa.' },
  { name: 'Huevo hervido', breaksFast: true, category: 'Proteínas', explanation: 'Excelente alimento para romper el ayuno en la ventana de alimentación.' },
  { name: 'Pechuga de pollo', breaksFast: true, category: 'Proteínas', explanation: 'Aporta proteínas y rompe la ventana de ayuno.' },
  { name: 'Proteína en polvo (Whey)', breaksFast: true, category: 'Suplementos', explanation: 'Activa la síntesis proteica y dispara la insulina.' },
  { name: 'Aceite de oliva (1 cucharada)', breaksFast: true, category: 'Grasas', explanation: 'Aunque es grasa pura, aporta 120 kcal e interrumpe la autofagia estricta.' },
  { name: 'Caldo de hueso (sin grasa)', breaksFast: false, category: 'Bebidas', explanation: 'Aporta electrolitos esenciales sin elevar significativamente la insulina.' },
  { name: 'Chicle sin azúcar', breaksFast: false, category: 'Snacks', explanation: 'En dosis mínimas no rompe el ayuno, pero puede estimular el apetito.' },
  { name: 'Bebida de almendras sin azúcar', breaksFast: true, category: 'Bebidas', explanation: 'Contiene calorías residuales que pueden pausar la autofagia.' },
  { name: 'Palta / Aguacate', breaksFast: true, category: 'Grasas', explanation: 'Ideal para la primera comida post-ayuno por sus grasas saludables.' },
];

export async function GET() {
  try {
    const client = await pool.connect();

    for (const food of initialFoods) {
      await client.query(
        `INSERT INTO food_database (food_name, breaks_fast, category, explanation) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [food.name, food.breaksFast, food.category, food.explanation]
      );
    }

    client.release();

    return NextResponse.json({ 
      success: true, 
      message: `Se insertaron ${initialFoods.length} alimentos correctamente en PostgreSQL.` 
    });
  } catch (error) {
    console.error('Error poblando la base de datos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error desconocido' 
    }, { status: 500 });
  }
}
