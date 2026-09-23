export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Calcular el día del año actual (1 a 365)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    
    // Rotar cada 100 días. Traemos 3 recetas para ofrecer opciones en el día.
    const offset = dayOfYear % 400;

    const res = await pool.query('SELECT * FROM recipes ORDER BY id ASC LIMIT 3 OFFSET $1', [offset]);
    return NextResponse.json({ recipes: res.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
