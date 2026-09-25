export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Falta el correo electrónico' }, { status: 400 });
    }

    // Buscar el usuario y sus métricas avanzadas (incluyendo weight_loss_method)
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: true, metrics: null });
    }

    const userId = userRes.rows[0].id;
    const metricsRes = await pool.query(
      'SELECT goal, gender, height_cm, weight_kg, target_weight_kg, diet_type, track_type, weight_loss_method, first_meal_time, last_meal_time FROM user_metrics WHERE user_id = $1',
      [userId]
    );

    if (metricsRes.rows.length === 0) {
      return NextResponse.json({ success: true, metrics: null });
    }

    return NextResponse.json({ success: true, metrics: metricsRes.rows[0] });
  } catch (error: any) {
    console.error('Error obteniendo métricas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
