export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Obtener el estado del ayuno al abrir la app
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') || 'usuario@demo.com';

  try {
    const result = await pool.query(
      'SELECT is_fasting, start_time, target_hours FROM fasting_state WHERE email = $1',
      [email]
    );
    return NextResponse.json({ success: true, state: result.rows[0] || null });
  } catch (error: any) {
    console.error('Error al obtener estado de ayuno:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Guardar el estado cuando el usuario inicia o detiene el ayuno
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email || 'usuario@demo.com';
    
    // Soportar ambas nomenclaturas (camelCase o snake_case) por seguridad
    const isFasting = body.isFasting !== undefined ? body.isFasting : body.is_fasting;
    const startTime = body.startTime !== undefined ? body.startTime : body.start_time;
    const targetHours = body.targetHours !== undefined ? body.targetHours : body.target_hours;

    const check = await pool.query('SELECT id FROM fasting_state WHERE email = $1', [email]);

    if (check.rows.length > 0) {
      await pool.query(
        'UPDATE fasting_state SET is_fasting = $1, start_time = $2, target_hours = $3 WHERE email = $4',
        [isFasting, startTime, targetHours, email]
      );
    } else {
      await pool.query(
        'INSERT INTO fasting_state (email, is_fasting, start_time, target_hours) VALUES ($1, $2, $3, $4)',
        [email, isFasting, startTime, targetHours]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al guardar estado de ayuno:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
