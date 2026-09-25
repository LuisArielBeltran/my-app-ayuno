export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, subscription } = await req.json();

    if (!email || !subscription) {
      return NextResponse.json({ success: false, error: 'Email y suscripción requeridos' }, { status: 400 });
    }

    // Guardar o actualizar la suscripción del usuario en la base de datos
    await pool.query(`
      INSERT INTO push_subscriptions (email, subscription)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `, [email, JSON.stringify(subscription)]);

    return NextResponse.json({ success: true, message: 'Suscripción push guardada con éxito' });
  } catch (error: any) {
    console.error('Error en /api/push/subscribe:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
