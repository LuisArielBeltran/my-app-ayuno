export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // Intentamos obtener la sesión de forma segura (evita el error 'Invalid URL' si falta NEXTAUTH_URL en Vercel)
    let session = null;
    try {
      session = await getServerSession();
    } catch (authErr) {
      console.warn('Aviso: No se pudo obtener la sesión de NextAuth automáticamente:', authErr);
    }

    const { 
      goal, 
      gender, 
      height, 
      weight, 
      targetWeight, 
      email, 
      firstMeal, 
      lastMeal, 
      dietType,
      weightLossMethod 
    } = await req.json();

    let userId = null;

    // 1. Si hay una sesión activa, usamos ese usuario
    if (session && session.user?.email) {
      const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      }
    }

    // 2. Si no hay sesión pero mandó un email al finalizar el cuestionario, lo buscamos o creamos
    let targetEmail = email || (session && session.user?.email);

    if (!userId && targetEmail) {
      let userRes = await pool.query('SELECT id FROM users WHERE email = $1', [targetEmail]);
      
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      } else {
        // Creamos un usuario rápido por defecto para no romper el flujo del embudo
        const dummyPassword = await bcrypt.hash('123456', 10);
        const newUser = await pool.query(
          'INSERT INTO users (email, password, created_at) VALUES ($1, $2, NOW()) RETURNING id',
          [targetEmail, dummyPassword]
        );
        userId = newUser.rows[0].id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Por favor ingresa un correo electrónico válido para guardar tu plan.' }, { status: 400 });
    }

    // 3. Determinar el track metabólico basado en el objetivo seleccionado
    let trackType = 'fat_loss';
    if (goal && goal.toLowerCase().includes('masa muscular')) {
      trackType = 'muscle_gain';
    } else if (goal && (goal.toLowerCase().includes('envejecimiento') || goal.toLowerCase().includes('desintoxicación'))) {
      trackType = 'maintenance';
    }

    // 4. Guardamos o actualizamos las métricas avanzadas del usuario en Railway
    await pool.query(
      `INSERT INTO user_metrics (user_id, goal, gender, height_cm, weight_kg, target_weight_kg, diet_type, track_type, weight_loss_method, first_meal_time, last_meal_time, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         goal = $2, 
         gender = $3, 
         height_cm = $4, 
         weight_kg = $5, 
         target_weight_kg = $6, 
         diet_type = $7, 
         track_type = $8, 
         weight_loss_method = $9,
         first_meal_time = $10, 
         last_meal_time = $11, 
         updated_at = NOW()`,
      [
        userId, 
        goal, 
        gender, 
        height ? parseFloat(height.replace(',', '.')) : null, 
        weight ? parseFloat(weight.replace(',', '.')) : null, 
        targetWeight ? parseFloat(targetWeight.replace(',', '.')) : null, 
        dietType || 'omnivore', 
        trackType, 
        weightLossMethod || 'fasting', 
        firstMeal || '09:00', 
        lastMeal || '22:00'
      ]
    );

    // 5. Registrar el peso inicial en el historial de peso
    if (weight && targetEmail) {
      await pool.query(
        'INSERT INTO weight_logs (email, weight_kg) VALUES ($1, $2)',
        [targetEmail, parseFloat(weight.replace(',', '.'))]
      );
    }

    return NextResponse.json({ success: true, message: '¡Métricas avanzadas y perfil guardados exitosamente!' });
  } catch (error: any) {
    console.error('Error en save-onboarding:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
