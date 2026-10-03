export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, subscription } = body;

    // Si falta el email o la suscripción, respondemos de forma limpia sin romper la app
    if (!email || !subscription) {
      return NextResponse.json({ success: true, message: 'Suscripción push omitida por falta de datos' });
    }

    // Guardar o actualizar la suscripción del usuario en la base de datos de forma segura
    await pool.query(`
      INSERT INTO push_subscriptions (email, subscription)
      VALUES ($1, $2)
      ON CONFLICT (email) 
      DO UPDATE SET subscription = EXCLUDED.subscription;
    `, [email, JSON.stringify(subscription)]);

    return NextResponse.json({ success: true, message: 'Suscripción push guardada con éxito' });
  } catch (error: any) {
    console.error('Error en /api/push/subscribe:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
