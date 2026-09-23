export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    // Definir precios según el plan seleccionado
    const prices: { [key: string]: { title: string; price: number } } = {
      '1': { title: 'Plan Ayuno - 1 Semana', price: 6590 },
      '4': { title: 'Plan Ayuno - 4 Semanas', price: 10392 },
      '12': { title: 'Plan Ayuno - 12 Semanas', price: 21592 },
    };

    const selected = prices[plan] || prices['12'];

    // Petición a la API oficial de Mercado Pago para generar la preferencia de pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, // Tu token de Mercado Pago configurado en las variables de entorno de Vercel
      },
      body: JSON.stringify({
        items: [
          {
            title: selected.title,
            quantity: 1,
            unit_price: selected.price,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
          failure: `${process.env.NEXTAUTH_URL}/onboarding/results?error=true`,
          pending: `${process.env.NEXTAUTH_URL}/dashboard?pending=true`,
        },
        auto_return: 'approved',
      }),
    });

    const mpData = await mpResponse.json();

    if (mpData.init_point) {
      return NextResponse.json({ success: true, init_point: mpData.init_point });
    } else {
      return NextResponse.json({ success: false, error: mpData }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
