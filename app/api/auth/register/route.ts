export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, goal, gender, height_cm, weight_kg, target_weight_kg, timezone } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'El correo ya está registrado' }, { status: 400 });
    }

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Zona horaria por defecto UTC si el cliente no la envía
    const userTimezone = timezone || 'UTC';

    // Insertar usuario incluyendo la zona horaria
    const newUser = await pool.query(
      'INSERT INTO users (email, password, timezone) VALUES ($1, $2, $3) RETURNING id, email, timezone',
      [email, hashedPassword, userTimezone]
    );

    const userId = newUser.rows[0].id;

    // Guardar métricas del onboarding si están presentes
    if (weight_kg) {
      await pool.query(
        `INSERT INTO user_metrics (user_id, goal, gender, height_cm, weight_kg, target_weight_kg)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE 
         SET goal = EXCLUDED.goal, gender = EXCLUDED.gender, height_cm = EXCLUDED.height_cm, weight_kg = EXCLUDED.weight_kg, target_weight_kg = EXCLUDED.target_weight_kg`,
        [userId, goal || 'general', gender || 'otro', height_cm || 170, weight_kg, target_weight_kg || weight_kg]
      );

      // Crear el registro inicial en el historial de peso
      await pool.query(
        'INSERT INTO weight_logs (email, weight_kg) VALUES ($1, $2)',
        [email, weight_kg]
      );
    }

    return NextResponse.json({ success: true, user: newUser.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
