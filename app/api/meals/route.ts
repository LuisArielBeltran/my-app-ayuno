export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// 1. GET: Para recuperar las comidas guardadas del día de hoy
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Falta el email' }, { status: 400 });
    }

    const result = await pool.query(`
      SELECT breakfast, snack1, lunch, snack2, merienda, snack3, dinner 
      FROM daily_meals 
      WHERE email = $1 AND log_date = CURRENT_DATE;
    `, [email]);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: true, 
        meals: { breakfast: '', snack1: '', lunch: '', snack2: '', merienda: '', snack3: '', dinner: '' } 
      });
    }

    return NextResponse.json({ success: true, meals: result.rows[0] });
  } catch (error: any) {
    console.error('Error al obtener comidas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. POST: Para guardar o actualizar automáticamente lo que el usuario escribe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, breakfast, snack1, lunch, snack2, merienda, snack3, dinner } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Falta el email' }, { status: 400 });
    }

    // Insertar o actualizar si ya existe un registro para el día de hoy (Upsert de PostgreSQL)
    await pool.query(`
      INSERT INTO daily_meals (email, log_date, breakfast, snack1, lunch, snack2, merienda, snack3, dinner)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email, log_date) 
      DO UPDATE SET 
        breakfast = EXCLUDED.breakfast,
        snack1 = EXCLUDED.snack1,
        lunch = EXCLUDED.lunch,
        snack2 = EXCLUDED.snack2,
        merienda = EXCLUDED.merienda,
        snack3 = EXCLUDED.snack3,
        dinner = EXCLUDED.dinner;
    `, [
      email, 
      breakfast || '', 
      snack1 || '', 
      lunch || '', 
      snack2 || '', 
      merienda || '', 
      snack3 || '', 
      dinner || ''
    ]);

    return NextResponse.json({ success: true, message: 'Comidas guardadas correctamente' });
  } catch (error: any) {
    console.error('Error al guardar comidas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
