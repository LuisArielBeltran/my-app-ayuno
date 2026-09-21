import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  try {
    // Obtenemos el historial de agua de los últimos 7 días
    const waterRes = await pool.query(
      `SELECT log_date, glasses FROM water_log 
       WHERE email = $1 
       ORDER BY log_date DESC LIMIT 7`,
      [email]
    );

    return NextResponse.json({ 
      waterHistory: waterRes.rows 
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}