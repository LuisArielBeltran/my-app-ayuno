import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Obtener el registro de agua del usuario al cargar la página
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Temporalmente usamos un email genérico hasta conectar el login real
  const email = searchParams.get('email') || 'usuario@demo.com'; 

  try {
    const result = await pool.query(
      'SELECT glasses FROM water_log WHERE email = $1 AND log_date = CURRENT_DATE',
      [email]
    );
    return NextResponse.json({ glasses: result.rows[0]?.glasses || 0 });
  } catch (error: any) {
    console.error('Error al obtener agua:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Guardar los vasos de agua cada vez que el usuario hace clic en el botón (+)
export async function POST(request: Request) {
  try {
    const { email = 'usuario@demo.com', glasses } = await request.json();

    const check = await pool.query(
      'SELECT id FROM water_log WHERE email = $1 AND log_date = CURRENT_DATE',
      [email]
    );

    if (check.rows.length > 0) {
      await pool.query(
        'UPDATE water_log SET glasses = $1 WHERE email = $2 AND log_date = CURRENT_DATE',
        [glasses, email]
      );
    } else {
      await pool.query(
        'INSERT INTO water_log (email, glasses, log_date) VALUES ($1, $2, CURRENT_DATE)',
        [email, glasses]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al guardar agua:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
