export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado. Por favor inicia sesión.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { goal, gender, height, weight, targetWeight, water } = await req.json();

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
