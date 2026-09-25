export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Seguridad opcional para cron jobs (opcional pero recomendado)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    // }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json({ success: false, error: 'Faltan claves VAPID' }, { status: 500 });
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:soporte@tudominio.com',
      publicKey,
      privateKey
    );

    // 1. Obtener todas las suscripciones activas y unirlas con el peso del usuario
    const query = `
      p.email, p.subscription, m.weight_kg 
      FROM push_subscriptions p
      LEFT JOIN users u ON p.email = u.email
      LEFT JOIN user_metrics m ON u.id = m.user_id
    `;
    // Nota: Hacemos la consulta de forma segura
    const subsRes = await pool.query(`
      SELECT p.email, p.subscription, m.weight_kg 
      FROM push_subscriptions p
      LEFT JOIN users u ON p.email = u.email
      LEFT JOIN user_metrics m ON u.id = m.user_id
    `);

    if (subsRes.rows.length === 0) {
      return NextResponse.json({ success: true, message: 'No hay suscriptores activos.' });
    }

    let sentCount = 0;

    // 2. Iterar y enviar la notificación personalizada a cada usuario
    for (const row of subsRes.rows) {
      try {
        const userWeight = Number(row.weight_kg) || 70;
        const waterTargetGlasses = Math.round((userWeight * 35) / 250);

        const title = '💧 ¡Recordatorio de Hidratación Inteligente!';
        const body = `Basado en tu peso actual (${userWeight}kg), tu meta hoy es alcanzar unos ${waterTargetGlasses} vasos de agua. ¡Tu metabolismo te lo agradece!`;
        
        const payload = JSON.stringify({ title, body, icon: '/icon.png' });

        await webpush.sendNotification(row.subscription, payload);
        sentCount++;
      } catch (err) {
        console.error(`Error enviando push a ${row.email}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Proceso completado. Se enviaron ${sentCount} alertas inteligentes.` 
    });
  } catch (error: any) {
    console.error('Error en cron-alerts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
