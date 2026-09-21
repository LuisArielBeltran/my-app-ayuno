import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ foods: [] });
  }

  try {
    // pool.query abre y cierra la conexión automáticamente de forma segura
    const result = await pool.query(
      `SELECT DISTINCT ON (food_name) * FROM food_database 
       WHERE food_name ILIKE $1 
       LIMIT 10`,
      [`%${query}%`]
    );
    
    return NextResponse.json({ foods: result.rows });
  } catch (error: any) {
    console.error('Error buscando alimentos:', error);
    return NextResponse.json({ error: 'Error interno en la búsqueda' }, { status: 500 });
  }
}
