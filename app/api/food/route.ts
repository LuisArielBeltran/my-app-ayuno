import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ foods: [] }, { status: 200 });
    }

    const client = await pool.connect();
    
    // ILIKE ignora mayúsculas y minúsculas. El % permite coincidencias parciales.
    const sql = `
      SELECT id, food_name as name, breaks_fast as "breaksFast" 
      FROM food_database 
      WHERE food_name ILIKE $1 
      LIMIT 10;
    `;
    const values = [`%${query}%`];
    
    const result = await client.query(sql, values);
    client.release();

    return NextResponse.json({ foods: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error buscando alimentos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}