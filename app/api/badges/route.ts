export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email requerido' }, { status: 400 });
    }

    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }
    const userId = userRes.rows[0].id;

    // Obtener medallas desbloqueadas
    const badgesRes = await pool.query(
      `SELECT b.*, ub.unlocked_at FROM badges b
       LEFT JOIN user_badges ub ON b.badge_code = ub.badge_code AND ub.user_id = $1`,
      [userId]
    );

    return NextResponse.json({ success: true, badges: badgesRes.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
