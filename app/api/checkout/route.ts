export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    const baseUrl = process.env.NEXTAUTH_URL || 'https://my-app-ayuno.vercel.app';

    // MODO SIMULACIÓN: Si aún no hay token de Mercado Pago, redirigimos directamente al dashboard para pruebas
    if (!process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN.trim() === '') {
      return NextResponse.json({ 
        success: true, 
        init_point: `${baseUrl}/dashboard?success=true&simulated=true` 
      });
    }

    // Definir precios según el plan seleccionado
    const prices: { [key: string]: { title: string; price: number } } = {
      '1': { title: 'Plan Ayuno - 1 Semana', price: 6590 },
      '4': { title: 'Plan Ayuno - 4 Semanas', price: 10392 },
      '12': { title: 'Plan Ayuno - 12 Semanas', price: 21592 },
    };

    const selected = prices[plan] || prices['12'];

    // Petición oficial a Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
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
          success: `${baseUrl}/dashboard?success=true`,
          failure: `${baseUrl}/onboarding/results?error=true`,
          pending: `${baseUrl}/dashboard?pending=true`,
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
