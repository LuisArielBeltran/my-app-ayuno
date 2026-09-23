export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hours = parseInt(searchParams.get('hours') || '0');

    // Buscar el tip metabólico correspondiente a las horas actuales de ayuno
    const result = await pool.query(
      `SELECT * FROM coaching_tips 
       WHERE phase_hours <= $1 
       ORDER BY phase_hours DESC 
       LIMIT 1`,
      [hours]
    );

    if (result.rows.length > 0) {
      return NextResponse.json({ success: true, tip: result.rows[0] });
    }

    // Si está recién empezando, devolver el primer tip disponible
    const defaultTip = await pool.query(
      `SELECT * FROM coaching_tips ORDER BY phase_hours ASC LIMIT 1`
    );

    return NextResponse.json({ success: true, tip: defaultTip.rows[0] || null });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
