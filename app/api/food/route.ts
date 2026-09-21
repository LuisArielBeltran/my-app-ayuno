import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ foods: [] });
  }

  try {
    // Buscamos todas las coincidencias
    const result = await pool.query(
      `SELECT * FROM food_database WHERE food_name ILIKE $1`,
      [`%${query}%`]
    );
    
    // Filtro antibalística: Eliminamos cualquier duplicado exacto
    const uniqueFoods: any[] = [];
    const seenNames = new Set();
    
    for (const food of result.rows) {
      // Convertimos a minúsculas y quitamos espacios extra para asegurar que sean idénticos
      const normalizedName = food.food_name.toLowerCase().trim();
      
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueFoods.push(food);
      }
    }

    // Solo devolvemos un máximo de 10 resultados únicos a la pantalla
    return NextResponse.json({ foods: uniqueFoods.slice(0, 10) });
  } catch (error: any) {
    console.error('Error buscando alimentos:', error);
    return NextResponse.json({ error: 'Error interno en la búsqueda' }, { status: 500 });
  }
}
