export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/generative-ai';

// Inicializar el SDK oficial de Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, email } = await req.json();

    if (!message) {
      return NextResponse.json({ success: false, error: 'Falta el mensaje' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: 'Falta configurar la GEMINI_API_KEY en el servidor' }, { status: 500 });
    }

    // Prompt del sistema integrando la identidad de tu programa
    const systemInstruction = `
      Eres el coach personal de inteligencia artificial de la aplicación "TIENES EL CONTROL", especializada en ayuno intermitente, nutrición adaptativa y hábitos saludables.
      Tu tono debe ser motivador, empático, firme pero amigable, guiando siempre al usuario a mantener el control de su metabolismo.
      Responde de forma concisa (máximo 3 o 4 párrafos cortos), dando consejos prácticos sobre hidratación, manejo de la ansiedad, porciones o cómo romper el ayuno correctamente.
    `;

    // Llamada al modelo Gemini 1.5 Flash (ideal para texto rápido y económico)
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 300,
        temperature: 0.7,
      }
    });

    const reply = response.text || '¡Hola! Estoy aquí contigo. Mantén tu enfoque y recuerda que tú tienes el control.';

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error en el coach de Gemini:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
