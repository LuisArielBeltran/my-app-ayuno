export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Configuramos VAPID de forma segura dentro de la función para evitar errores en el Build de Vercel
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json({ success: false, error: 'Faltan las claves VAPID en las variables de entorno' }, { status: 500 });
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:soporte@tudominio.com',
      publicKey,
      privateKey
    );

    const { email, alertType } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email requerido' }, { status: 400 });
    }

    // 1. Consultar métricas reales del usuario (peso y altura)
    const metricsRes = await pool.query(
      'SELECT weight_kg, height_cm, track_type, goal FROM user_metrics WHERE user_id = (SELECT id FROM users WHERE email = $1)',
      [email]
    );

    let waterTargetGlasses = 8;
    if (metricsRes.rows.length > 0) {
      const userWeight = Number(metricsRes.rows[0].weight_kg) || 70;
      const totalMlNeeded = userWeight * 35;
      waterTargetGlasses = Math.round(totalMlNeeded / 250);
    }

    // 2. Buscar las suscripciones push del usuario
    const subRes = await pool.query('SELECT subscription FROM push_subscriptions WHERE email = $1', [email]);

    if (subRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'El usuario no tiene notificaciones push activas' }, { status: 404 });
    }

    // 3. Definir mensajes personalizados
    let title = '¡TIENES EL CONTROL! ⚡';
    let body = 'Tu coach está aquí para recordarte que vas excelente.';

    if (alertType === 'water') {
      title = '💧 ¡Hora de hidratación inteligente!';
      body = `Basado en tu peso actual, tu meta hoy es alcanzar unos ${waterTargetGlasses} vasos de agua. ¡Mantén tus células activas!`;
    } else if (alertType === 'mood_check') {
      title = '🧠 ¿Cómo te sientes en este momento?';
      body = '¿Hay ansiedad o hambre emocional? Entra al panel y cuéntale a tu coach o tómate un té verde. ¡Tú mandas!';
    } else if (alertType === 'fasting_reminder') {
      title = '🔥 Ventana Metabólica Activa';
      body = 'Tu organismo está optimizando la quema de grasa. Respira hondo, mantén el enfoque y recuerda por qué empezaste.';
    }

    const payload = JSON.stringify({ title, body, icon: '/icon.png' });

    // 4. Disparar notificaciones
    const sendPromises = subRes.rows.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, payload);
      } catch (err) {
        console.error('Error al enviar push individual:', err);
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: 'Alerta inteligente enviada con éxito', waterTargetGlasses });
  } catch (error: any) {
    console.error('Error en smart-alert:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
