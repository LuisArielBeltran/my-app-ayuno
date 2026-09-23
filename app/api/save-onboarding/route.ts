export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    // Obtenemos la sesión actual del usuario
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado. Por favor inicia sesión.' }, { status: 401 });
    }

    // Nota: Dependiendo de cómo guardes la sesión, el id puede estar en session.user.id o necesitamos buscar por email
    const userEmail = session.user.email;
    const { goal, gender, height, weight, targetWeight } = await req.json();

    // Buscamos el ID del usuario en Railway mediante su email si el objeto user no incluye el id directamente
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado en la base de datos.' }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Guardamos o actualizamos las métricas del usuario en Railway
    await pool.query(
      `INSERT INTO user_metrics (user_id, goal, gender, height_cm, weight_kg, target_weight_kg, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET goal = $2, gender = $3, height_cm = $4, weight_kg = $5, target_weight_kg = $6, updated_at = NOW()`,
      [userId, goal, gender, height, weight, targetWeight]
    );

    return NextResponse.json({ success: true, message: '¡Métricas guardadas exitosamente!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
