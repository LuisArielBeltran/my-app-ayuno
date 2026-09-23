export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Obtener el estado actual del ayuno por email
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email no proporcionado' }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM fasting_state WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: true, fasting: { is_fasting: false, start_time: null, target_hours: 16 } });
    }

    return NextResponse.json({ success: true, fasting: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Iniciar o romper/finalizar el ayuno
export async function POST(req: Request) {
  try {
    const { email, is_fasting, target_hours } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email no proporcionado' }, { status: 400 });
    }

    const startTime = is_fasting ? new Date() : null;

    // Actualizar o insertar el estado del ayuno
    const result = await pool.query(
      `INSERT INTO fasting_state (email, is_fasting, start_time, target_hours)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) 
       DO UPDATE SET is_fasting = EXCLUDED.is_fasting, 
                     start_time = EXCLUDED.start_time, 
                     target_hours = EXCLUDED.target_hours
       RETURNING *;`,
      [email, is_fasting, startTime, target_hours || 16]
    );

    return NextResponse.json({ success: true, fasting: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
