import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ foods: [] });
  }

  try {
    const client = await pool.connect();
    
    // ILIKE ignora mayúsculas/minúsculas. Los % permiten encontrar la palabra aunque esté incompleta.
    const result = await client.query(
      `SELECT * FROM food_database 
       WHERE unaccent(food_name) ILIKE unaccent($1) 
       OR food_name ILIKE $1 
       LIMIT 10`,
      [`%${query}%`]
    );
    
    client.release();

    return NextResponse.json({ foods: result.rows });
  } catch (error) {
    console.error('Error buscando alimentos:', error);
    // Fallback simple si la base de datos no tiene instalada la extensión unaccent
    try {
        const client = await pool.connect();
        const fallbackResult = await client.query(
          `SELECT * FROM food_database WHERE food_name ILIKE $1 LIMIT 10`,
          [`%${query}%`]
        );
        client.release();
        return NextResponse.json({ foods: fallbackResult.rows });
    } catch (fallbackError) {
        return NextResponse.json({ error: 'Error interno en la búsqueda' }, { status: 500 });
    }
  }
}
