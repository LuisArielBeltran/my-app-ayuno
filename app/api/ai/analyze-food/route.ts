export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function checkLocalFastAnswer(text: string): string | null {
  const lower = text.toLowerCase().trim();
  
  if (lower.includes('agua') && (lower.includes('rompe') || lower.includes('ayuno') || lower.includes('toma') || lower.includes('beber'))) {
    return '💧 El agua pura no rompe el ayuno en absoluto. Es la base fundamental para mantener la hidratación, evitar la fatiga y potenciar la limpieza celular.';
  }
  if (lower.includes('mate') && (lower.includes('rompe') || lower.includes('ayuno') || lower.includes('amargo'))) {
    if (lower.includes('dulce') || lower.includes('azúcar') || lower.includes('miel')) {
      return '❌ El mate dulce, con azúcar o miel sí rompe el ayuno de inmediato debido al pico de insulina.';
    }
    return '🧉 El mate amargo (cimarrón o mate solo con yerba y agua) está completamente permitido. No eleva la glucosa y aporta excelentes antioxidantes.';
  }
  if (lower.includes('café') && (lower.includes('rompe') || lower.includes('ayuno'))) {
    if (lower.includes('leche') || lower.includes('crema') || lower.includes('azúcar') || lower.includes('cortado')) {
      return '❌ El café con leche, crema o azúcar rompe el ayuno por la presencia de lactosa y proteínas/grasas que activan la digestión.';
    }
    return '☕ El café negro, espresso o americano sin azúcar ni leche está totalmente permitido y estimula la autofagia y la quema de grasa.';
  }
  if (lower.includes('té') && (lower.includes('rompe') || lower.includes('ayuno'))) {
    return '🍵 Las infusiones de té verde, negro o hierbas (manzanilla, boldo, menta) sin azúcar ni endulzantes calóricos están permitidas y no generan respuesta glucémica.';
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Falta configurar la GEMINI_API_KEY' }, { status: 500 });
    }

    const body = await req.json();
    const { prompt, imageBase64, email, chatHistory, currentMeals } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Falta el email del usuario para validar consumo' }, { status: 400 });
    }

    const userText = prompt || '¿Esta comida rompe mi ayuno y qué componentes tiene?';
    const isImageQuery = !!imageBase64;

    if (!isImageQuery && userText) {
      const localAnswer = checkLocalFastAnswer(userText);
      if (localAnswer) {
        return NextResponse.json({ success: true, text: localAnswer, reply: localAnswer, source: 'local_cache' });
      }
    }

    // --- VERIFICACIÓN DE LÍMITES EN BASE DE DATOS ---
    await pool.query(`
      INSERT INTO user_ai_usage (email, usage_date, text_queries_count, image_queries_count, plan_type)
      VALUES ($1, CURRENT_DATE, 0, 0, 'basic')
      ON CONFLICT (email, usage_date) DO NOTHING;
    `, [email]);

    const usageResult = await pool.query(`
      SELECT text_queries_count, image_queries_count, plan_type 
      FROM user_ai_usage 
      WHERE email = $1 AND usage_date = CURRENT_DATE;
    `, [email]);

    const usage = usageResult.rows[0];
    const plan = usage.plan_type || 'basic';

    const limits = {
      basic: { text: 4, image: 2 },
      plus: { text: 10, image: 5 }
    };
    const currentLimits = plan === 'plus' ? limits.plus : limits.basic;

    if (isImageQuery && usage.image_queries_count >= currentLimits.image) {
      return NextResponse.json({
        success: false, limitReached: true, limitType: 'image',
        reply: '📸 Has alcanzado tu límite diario de análisis de fotos. ¡Pásate al Plan Plus para seguir escaneando tus platos!'
      });
    }

    if (!isImageQuery && usage.text_queries_count >= currentLimits.text) {
      return NextResponse.json({
        success: false, limitReached: true, limitType: 'text',
        reply: '💬 Has alcanzado tu límite diario de consultas al coach. ¡Actualiza al Plan Plus para seguir chateando!'
      });
    }

    // --- CONSULTAR EL TIPO DE DIETA DEL USUARIO DESDE LA BD (CORREGIDO) ---
    const dietResult = await pool.query(`
      SELECT UM.diet_type FROM user_metrics UM
      JOIN users U ON UM.user_id = U.id
      WHERE U.email = $1;
    `, [email]).catch(() => null);

    let userDietType = 'omnivore';
    if (dietResult && dietResult.rows.length > 0 && dietResult.rows[0].diet_type) {
      userDietType = dietResult.rows[0].diet_type.toLowerCase();
    }

    // --- LLAMADA A GEMINI CON CONTEXTO Y PERFIL DIETÉTICO ADAPTATIVO ---
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      systemInstruction: `
        Eres el coach experto en ayuno intermitente, nutrición clínica y adaptativa de la aplicación "TIENES EL CONTROL".
        Tu tono es motivador, empático y firme. 

        PERFIL NUTRICIONAL ESTRICTO DEL USUARIO ACTUAL: ${userDietType.toUpperCase()}
        - Si es OMNÍVORO: Puede consumir cualquier fuente de proteína animal y vegetal de manera equilibrada.
        - Si es VEGETARIANO: Excluye absolutamente carnes, pescados y mariscos. Consume huevos, lácteos y derivados vegetales. NUNCA recomiendes carnes, aves ni caldos de origen animal.
        - Si es VEGANO: Excluye 100% cualquier producto de origen animal (carne, pescado, huevos, lácteos, miel). Todas tus recomendaciones de proteínas, calorías y micronutrientes deben basarse estrictamente en fuentes vegetales (legumbres, tofu, tempeh, frutos secos, semillas).

        Si el usuario te pide una receta, plan de comidas o menú, responde de forma estructurada y completa acorde a su perfil dietético. 
        NUNCA dejes oraciones a la mitad ni ideas incompletas. Utiliza el registro de comidas del día y el historial para ofrecerle respuestas y recomendaciones ultra personalizadas y seguras para su salud.
      `
    });

    let finalPromptText = userText;
    let contextString = "";

    if (currentMeals) {
      const comidasRegistradas = Object.entries(currentMeals)
        .filter(([_, text]) => typeof text === 'string' && text.trim() !== '')
        .map(([meal, text]) => `- ${meal}: ${text}`)
        .join('\n');
        
      if (comidasRegistradas) {
        contextString += `[ALIMENTACIÓN REGISTRADA POR EL USUARIO HOY]\n${comidasRegistradas}\n\n`;
      }
    }

    if (chatHistory && chatHistory.length > 0) {
      const historyString = chatHistory
        .map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Coach'}: ${m.text}`)
        .join('\n');
      contextString += `[CONTEXTO DE LA CONVERSACIÓN PREVIA]\n${historyString}\n\n`;
    }

    if (contextString) {
      finalPromptText = `${contextString}[MENSAJE ACTUAL DEL USUARIO]\n${userText}`;
    }

    let contents: any[] = [];

    if (isImageQuery) {
      let base64Data = imageBase64;
      let mimeType = 'image/jpeg';
      if (imageBase64.includes('base64,')) {
        const parts = imageBase64.split('base64,');
        mimeType = parts[0].replace('data:', '').replace(';', '');
        base64Data = parts[1];
      }
      contents = [
        { inlineData: { data: base64Data, mimeType: mimeType } },
        { text: finalPromptText }
      ];
    } else {
      contents = [{ text: finalPromptText }];
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: contents }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });

    const replyText = result.response.text() || '¡Aquí estoy contigo! Mantén tu enfoque.';

    // --- ACTUALIZAR CONTADOR ---
    if (isImageQuery) {
      await pool.query(`UPDATE user_ai_usage SET image_queries_count = image_queries_count + 1 WHERE email = $1 AND usage_date = CURRENT_DATE;`, [email]);
    } else {
      await pool.query(`UPDATE user_ai_usage SET text_queries_count = text_queries_count + 1 WHERE email = $1 AND usage_date = CURRENT_DATE;`, [email]);
    }

    return NextResponse.json({ success: true, text: replyText, reply: replyText });

  } catch (error: any) {
    console.error('Error en API de IA con Gemini:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
