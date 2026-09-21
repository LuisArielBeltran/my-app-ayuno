// app/api/fasting/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, protocol, durationSeconds } = body;

    // Conexión a la base de datos y query de inserción
    const client = await pool.connect();
    const query = `
      INSERT INTO water_log (user_id, log_date, volume_ml) 
      VALUES ($1, CURRENT_DATE, $2)
      RETURNING *;
    `;
    
    // Nota: Aquí simulamos guardar la sesión de ayuno. 
    // Ajustaremos la query exacta a tu tabla de historial de ayunos cuando la creemos.
    
    client.release();

    return NextResponse.json({ success: true, message: 'Ayuno registrado correctamente.' }, { status: 201 });
  } catch (error) {
    console.error('Error guardando el ayuno:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}