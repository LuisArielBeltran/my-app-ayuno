export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, timezone, plan } = body;

    // 1. Validar campos obligatorios
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'El correo electrónico y la contraseña son requeridos' 
      }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Verificar si el usuario ya existe en la base de datos de Railway
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1;', 
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Este correo ya se encuentra registrado. Inicia sesión.' 
      }, { status: 400 });
    }

    // 3. Cifrar la contraseña de forma segura con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insertar el usuario real en la tabla 'users'
    const userResult = await pool.query(`
      INSERT INTO users (email, password, timezone)
      VALUES ($1, $2, $3)
      RETURNING id, email;
    `, [cleanEmail, hashedPassword, timezone || 'UTC']);

    const userId = userResult.rows[0].id;

    // 5. Inicializar su registro base en 'user_metrics' para que la IA y el panel funcionen
    await pool.query(`
      INSERT INTO user_metrics (user_id, diet_type, weight_loss_method)
      VALUES ($1, 'omnivore', 'fasting')
      ON CONFLICT (user_id) DO NOTHING;
    `, [userId]);

    // 6. Configurar el plan inicial de IA (básico o plus según el plan elegido en el checkout)
    const planType = (plan && (plan.includes('12') || plan.includes('4'))) ? 'plus' : 'basic';
    await pool.query(`
      INSERT INTO user_ai_usage (email, usage_date, text_queries_count, image_queries_count, plan_type)
      VALUES ($1, CURRENT_DATE, 0, 0, $2)
      ON CONFLICT (email, usage_date) 
      DO UPDATE SET plan_type = EXCLUDED.plan_type;
    `, [cleanEmail, planType]);

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario registrado y guardado en Railway correctamente' 
    });

  } catch (error: any) {
    console.error('Error crítico en /api/register:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno al registrar el usuario' 
    }, { status: 500 });
  }
}
