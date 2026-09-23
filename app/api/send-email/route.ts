import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, subject, message } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Falta el correo electrónico' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Mi Ayuno <onboarding@resend.dev>', // O tu dominio verificado en Resend
      to: [email],
      subject: subject || 'Actualización de tu Plan de Ayuno',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">Mi Ayuno 🥗</h2>
          <p style="color: #333; font-size: 16px;">¡Hola!</p>
          <p style="color: #555; font-size: 14px; line-height: 1.5;">${message}</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://tu-dominio.railway.app/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ir a mi Panel</a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">Este es un mensaje automático de tu Coach Metabólico.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error enviando correo:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
