export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      password, 
      goal, 
      gender, 
      height_cm, 
      height,
      weight_kg, 
      weight,
      target_weight_kg, 
      targetWeight,
      timezone,
      dietType,
      weightLossMethod,
      firstMeal,
      lastMeal,
      hasActivity,
      activityType,
      activityOther,
      activityHours
    } = body;

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

    const finalWeight = weight_kg || weight;
    const finalHeight = height_cm || height;
    const finalTargetWeight = target_weight_kg || targetWeight || finalWeight;

    // Determinar el track metabólico basado en el objetivo
    let trackType = 'fat_loss';
    const targetGoal = goal || 'Bajar peso y mantenerme';
    if (targetGoal.toLowerCase().includes('masa muscular')) {
      trackType = 'muscle_gain';
    } else if (targetGoal.toLowerCase().includes('envejecimiento') || targetGoal.toLowerCase().includes('desintoxicación')) {
      trackType = 'maintenance';
    }

    // Resolver tipo de actividad y booleano
    const finalActivityType = activityType === 'Otras' ? activityOther : activityType;
    const parsedHasActivity = hasActivity === true || hasActivity === 'true' || hasActivity === 'SI' || hasActivity === 'Sí';

    // Guardar métricas del onboarding si están presentes
    if (finalWeight) {
      const heightVal = finalHeight ? parseFloat(String(finalHeight).replace(',', '.')) : 170;
      const weightVal = parseFloat(String(finalWeight).replace(',', '.'));
      const targetWeightVal = finalTargetWeight ? parseFloat(String(finalTargetWeight).replace(',', '.')) : weightVal;

      await pool.query(
        `INSERT INTO user_metrics (
           user_id, goal, gender, height_cm, weight_kg, target_weight_kg, 
           diet_type, track_type, weight_loss_method, first_meal_time, last_meal_time, 
           has_activity, activity_type, activity_hours, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
         ON CONFLICT (user_id) DO UPDATE 
         SET goal = EXCLUDED.goal, 
             gender = EXCLUDED.gender, 
             height_cm = EXCLUDED.height_cm, 
             weight_kg = EXCLUDED.weight_kg, 
             target_weight_kg = EXCLUDED.target_weight_kg,
             diet_type = EXCLUDED.diet_type,
             track_type = EXCLUDED.track_type,
             weight_loss_method = EXCLUDED.weight_loss_method,
             first_meal_time = EXCLUDED.first_meal_time,
             last_meal_time = EXCLUDED.last_meal_time,
             has_activity = EXCLUDED.has_activity,
             activity_type = EXCLUDED.activity_type,
             activity_hours = EXCLUDED.activity_hours,
             updated_at = NOW()`,
        [
          userId, 
          targetGoal, 
          gender || 'Hombre', 
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

      // Crear el registro inicial en el historial de peso
      await pool.query(
        'INSERT INTO weight_logs (email, weight_kg) VALUES ($1, $2)',
        [email, weightVal]
      );
    }

    return NextResponse.json({ success: true, user: newUser.rows[0] });
  } catch (error: any) {
    console.error('Error en reg.ts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
