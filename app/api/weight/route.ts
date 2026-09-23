export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Obtener historial de peso y rellenar automáticamente con el peso del onboarding si está vacío
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email no proporcionado' }, { status: 400 });
    }

    // 1. Obtener historial de peso existente
    const weightsResult = await pool.query(
      `SELECT * FROM weight_logs WHERE email = $1 ORDER BY log_date ASC`,
      [email]
    );
    let weightRows = weightsResult.rows;

    // 2. Obtener el peso inicial y meta desde user_metrics (onboarding)
    const metrics = await pool.query(
      `SELECT um.target_weight_kg, um.weight_kg as initial_weight 
       FROM user_metrics um 
       JOIN users u ON um.user_id = u.id 
       WHERE u.email = $1`,
      [email]
    );

    let targetWeight = null;

    if (metrics.rows.length > 0) {
      targetWeight = metrics.rows[0].target_weight_kg;

      // Si no hay historial en weight_logs, pero SÍ hay un peso inicial en el onboarding, lo migramos automáticamente
      if (weightRows.length === 0 && metrics.rows[0].initial_weight) {
        const initialWeight = metrics.rows[0].initial_weight;
        const insertInitial = await pool.query(
          `INSERT INTO weight_logs (email, weight_kg) VALUES ($1, $2) RETURNING *;`,
          [email, initialWeight]
        );
        weightRows = [insertInitial.rows[0]];
      }
    }

    return NextResponse.json({ 
      success: true, 
      weights: weightRows,
      target_weight: targetWeight
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Registrar un nuevo peso de seguimiento
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
