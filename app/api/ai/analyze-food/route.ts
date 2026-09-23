export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Falta configurar la API Key de OpenAI' }, { status: 500 });
    }

    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'No se proporcionó ninguna imagen' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    // Llamada al modelo multimodal (ej. gpt-4o-mini o gpt-4o)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un nutriente experto en ayuno intermitente. Analiza la comida de la imagen y responde estrictamente en formato JSON con las siguientes claves: breaks_fast (boolean: true si rompe el ayuno, false si está permitido), food_detected (string con lo que ves), explanation (por qué afecta o no al ayuno metabólico) y suggestion (un consejo breve).'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '¿Esta comida rompe mi ayuno y qué componentes tiene?' },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json({ success: true, analysis: result });
  } catch (error: any) {
    console.error('Error analizando la imagen con IA:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
