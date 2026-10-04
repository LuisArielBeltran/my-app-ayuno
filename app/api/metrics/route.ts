export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Falta el correo electrónico' }, { status: 400 });
    }

    // Buscar el usuario en la base de datos
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: true, metrics: null });
    }

    const userId = userRes.rows[0].id;

    // Consultar todas las métricas incluyendo los datos de actividad física y gimnasio
    const metricsRes = await pool.query(
      `SELECT goal, gender, height_cm, weight_kg, target_weight_kg, 
              diet_type, track_type, weight_loss_method, 
              first_meal_time, last_meal_time, 
              has_activity, activity_type, activity_hours 
       FROM user_metrics WHERE user_id = $1`,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, goal, track_type, diet_type, weight_loss_method, has_activity, activity_type } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Falta el correo electrónico' }, { status: 400 });
    }

    // 1. Buscar el ID del usuario mediante su email
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userId = userRes.rows[0].id;

    // 2. Verificar si ya existen métricas para este usuario
    const checkRes = await pool.query('SELECT id FROM user_metrics WHERE user_id = $1', [userId]);

    let result;
    if (checkRes.rows.length === 0) {
      // Insertar si no existen registros previos
      result = await pool.query(
        `INSERT INTO user_metrics (user_id, goal, track_type, diet_type, weight_loss_method, has_activity, activity_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, goal || null, track_type || null, diet_type || null, weight_loss_method || null, has_activity ?? null, activity_type || null]
      );
    } else {
      // Actualizar usando COALESCE para conservar los datos que no se estén modificando en este momento
      result = await pool.query(
        `UPDATE user_metrics 
         SET goal = COALESCE($2, goal),
             track_type = COALESCE($3, track_type),
             diet_type = COALESCE($4, diet_type),
             weight_loss_method = COALESCE($5, weight_loss_method),
             has_activity = COALESCE($6, has_activity),
             activity_type = COALESCE($7, activity_type)
         WHERE user_id = $1
         RETURNING *`,
        [userId, goal || null, track_type || null, diet_type || null, weight_loss_method || null, has_activity ?? null, activity_type || null]
      );
    }

    return NextResponse.json({ success: true, metrics: result.rows[0] });
  } catch (error: any) {
    console.error('Error actualizando métricas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
