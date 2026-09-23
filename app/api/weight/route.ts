export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Obtener el historial de peso y la meta del usuario
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email no proporcionado' }, { status: 400 });
    }

    // Obtener historial de peso
    const weights = await pool.query(
      `SELECT * FROM weight_logs WHERE email = $1 ORDER BY log_date ASC`,
      [email]
    );

    // Obtener peso objetivo desde user_metrics (si existe)
    const metrics = await pool.query(
      `SELECT um.target_weight_kg, um.weight_kg as initial_weight 
       FROM user_metrics um 
       JOIN users u ON um.user_id = u.id 
       WHERE u.email = $1`,
      [email]
    );

    return NextResponse.json({ 
      success: true, 
      weights: weights.rows,
      target_weight: metrics.rows.length > 0 ? metrics.rows[0].target_weight_kg : null
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Registrar un nuevo peso
export async function POST(req: Request) {
  try {
    const { email, weight_kg } = await req.json();

    if (!email || !weight_kg) {
      return NextResponse.json({ success: false, error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO weight_logs (email, weight_kg) VALUES ($1, $2) RETURNING *;`,
      [email, weight_kg]
    );

    return NextResponse.json({ success: true, log: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
