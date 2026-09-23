export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    
    // Mostramos 1 artículo principal rotativo al día
    const offset = dayOfYear % 400;

    const res = await pool.query('SELECT * FROM learning_articles ORDER BY id ASC LIMIT 1 OFFSET $1', [offset]);
    return NextResponse.json({ articles: res.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
