export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    let session = null;
    try {
      session = await getServerSession();
    } catch (authErr) {
      console.warn('Aviso: No se pudo obtener la sesión de NextAuth automáticamente:', authErr);
    }

    const body = await req.json();
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
      weightLossMethod,
      hasActivity,
      activityType,
      activityOther,
      activityHours
    } = body;

    let userId = null;

    // 1. Si hay una sesión activa, usamos ese usuario
    if (session && session.user?.email) {
      const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      }
    }

    // 2. Si no hay sesión pero mandó un email, lo buscamos o creamos
    let targetEmail = email || (session && session.user?.email);

    if (!userId && targetEmail) {
      let userRes = await pool.query('SELECT id FROM users WHERE email = $1', [targetEmail]);
      
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      } else {
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

    // 3. Determinar el track metabólico basado en el objetivo
    let trackType = 'fat_loss';
    if (goal && goal.toLowerCase().includes('masa muscular')) {
      trackType = 'muscle_gain';
    } else if (goal && (goal.toLowerCase().includes('envejecimiento') || goal.toLowerCase().includes('desintoxicación'))) {
      trackType = 'maintenance';
    }

    // Resolver el tipo de actividad
    const finalActivityType = activityType === 'Otras' ? activityOther : activityType;
    
    // Asegurar que hasActivity sea booleano real (true/false)
    const parsedHasActivity = hasActivity === true || hasActivity === 'true' || hasActivity === 'SI' || hasActivity === 'Sí';

    const heightVal = height ? parseFloat(String(height).replace(',', '.')) : null;
    const weightVal = weight ? parseFloat(String(weight).replace(',', '.')) : null;
    const targetWeightVal = targetWeight ? parseFloat(String(targetWeight).replace(',', '.')) : null;

    // 4. Guardar o actualizar métricas de forma segura (Verificando existencia previa)
    const existingMetrics = await pool.query('SELECT id FROM user_metrics WHERE user_id = $1', [userId]);

    if (existingMetrics.rows.length > 0) {
      // Actualizamos si ya existen
      await pool.query(
        `UPDATE user_metrics SET 
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
           has_activity = $12, 
           activity_type = $13, 
           activity_hours = $14, 
           updated_at = NOW()
         WHERE user_id = $1`,
        [
          userId, 
          goal || null, 
          gender || null, 
          heightVal, 
          weightVal, 
          targetWeightVal, 
          dietType || 'omnivore', 
          trackType, 
          weightLossMethod || 'fasting', 
          firstMeal || '09:00', 
          lastMeal || '22:00',
          parsedHasActivity,
          finalActivityType || null,
          activityHours || null
        ]
      );
    } else {
      // Insertamos si es la primera vez
      await pool.query(
        `INSERT INTO user_metrics (
           user_id, goal, gender, height_cm, weight_kg, target_weight_kg, diet_type, track_type, 
           weight_loss_method, first_meal_time, last_meal_time, has_activity, activity_type, activity_hours, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())`,
        [
          userId, 
          goal || null, 
          gender || null, 
          heightVal, 
          weightVal, 
          targetWeightVal, 
          dietType || 'omnivore', 
          trackType, 
          weightLossMethod || 'fasting', 
          firstMeal || '09:00', 
          lastMeal || '22:00',
          parsedHasActivity,
          finalActivityType || null,
          activityHours || null
        ]
      );
    }

    // 5. Registrar el peso inicial en el historial
    if (weightVal && targetEmail) {
      await pool.query(
        'INSERT INTO weight_logs (email, weight_kg) VALUES ($1, $2)',
        [targetEmail, weightVal]
      );
    }

    return NextResponse.json({ success: true, message: '¡Métricas y perfil guardados exitosamente!' });
  } catch (error: any) {
    console.error('Error crítico en save-onboarding:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
