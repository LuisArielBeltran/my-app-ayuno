export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, subscription } = await req.json();

    if (!email || !subscription) {
      return NextResponse.json({ success: false, error: 'Email y suscripción requeridos' }, { status: 400 });
    }

    // 1. Limpiar suscripciones anteriores de este mismo correo para evitar duplicados
    await pool.query('DELETE FROM push_subscriptions WHERE email = $1', [email]);

    // 2. Insertar la nueva suscripción activa del navegador
    await pool.query(`
      INSERT INTO push_subscriptions (email, subscription, created_at)
      VALUES ($1, $2, NOW());
    `, [email, JSON.stringify(subscription)]);

    return NextResponse.json({ success: true, message: 'Suscripción push guardada con éxito' });
  } catch (error: any) {
    console.error('Error en /api/push/subscribe:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
