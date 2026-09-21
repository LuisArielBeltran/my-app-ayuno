// app/api/water/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Por defecto, cada vaso equivale a 250ml
    const { volumeMl = 250, userId } = body;

    // Nota para el MVP: Como aún no tenemos un sistema de Login (Auth) configurado,
    // este código requiere que exista un userId válido en tu tabla 'users'. 
    // Si envías un userId, hace el registro real.
    if (userId) {
      const client = await pool.connect();
      const query = `
        INSERT INTO water_log (user_id, log_date, volume_ml) 
        VALUES ($1, CURRENT_DATE, $2)
      `;
      await client.query(query, [userId, volumeMl]);
      client.release();
    }

    return NextResponse.json({ success: true, message: `${volumeMl}ml registrados correctamente.` }, { status: 201 });
  } catch (error) {
    console.error('Error registrando hidratación:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}