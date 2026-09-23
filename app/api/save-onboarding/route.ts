export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const { goal, gender, height, weight, targetWeight, email } = await req.json();

    let userId = null;

    // 1. Si hay una sesión activa, usamos ese usuario
    if (session && session.user?.email) {
      const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      }
    }

    // 2. Si no hay sesión pero mandó un email al finalizar el cuestionario, lo buscamos o creamos
    if (!userId && email) {
      let userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      } else {
        // Creamos un usuario rápido por defecto para no romper el flujo del embudo
        const dummyPassword = await bcrypt.hash('123456', 10);
        const newUser = await pool.query(
          'INSERT INTO users (email, password, created_at) VALUES ($1, $2, NOW()) RETURNING id',
          [email, dummyPassword]
        );
        userId = newUser.rows[0].id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Por favor ingresa un correo electrónico válido para guardar tu plan.' }, { status: 400 });
    }

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
