export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    // Si no hay texto escrito, devolvemos un arreglo vacío (no muestra resultados automáticos)
    if (!query.trim()) {
      return NextResponse.json({ success: true, results: [] });
    }

    // Búsqueda insensible a mayúsculas por nombre o sinónimos
    const searchPattern = `%${query.toLowerCase()}%`;
    const result = await pool.query(
      `SELECT * FROM food_database 
       WHERE LOWER(food_name) LIKE $1 OR LOWER(synonyms) LIKE $1 
       ORDER BY food_name ASC`,
      [searchPattern]
    );

    return NextResponse.json({ success: true, results: result.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
