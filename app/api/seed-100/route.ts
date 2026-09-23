export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 1. Limpiamos las tablas
    await pool.query('TRUNCATE TABLE recipes RESTART IDENTITY CASCADE;');
    await pool.query('TRUNCATE TABLE learning_articles RESTART IDENTITY CASCADE;');

    // 2. Generador de 400 Recetas (20 Proteínas x 20 Bases)
    const proteinas = ['Pollo a la plancha', 'Salmón al horno', 'Tofu marinado', 'Huevos revueltos', 'Pavo asado', 'Atún natural', 'Ternera magra', 'Lentejas especiadas', 'Garbanzos crujientes', 'Cerdo magro', 'Camarones al ajillo', 'Pechuga desmenuzada', 'Merluza al vapor', 'Tempeh a la plancha', 'Edamame', 'Seitán dorado', 'Queso panela asado', 'Filete de pescado', 'Frijoles negros', 'Hamburguesa de lentejas'];
    const bases = ['Quinoa', 'Arroz integral', 'Boniato', 'Fideos de calabacín', 'Espinacas frescas', 'Brócoli al vapor', 'Arroz de coliflor', 'Pasta integral', 'Patata asada', 'Mix de hojas verdes', 'Col rizada (Kale)', 'Champiñones salteados', 'Espárragos', 'Cuscús integral', 'Amaranto', 'Trigo sarraceno', 'Zanahorias asadas', 'Calabaza al horno', 'Pimientos asados', 'Fideos de arroz'];
    
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        await pool.query(
          `INSERT INTO recipes (title, category, prep_time, calories, protein_g, carbs_g, fat_g, ingredients, instructions, icon_symbol)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            `Bowl de ${proteinas[i]} con ${bases[j]}`,
            j % 2 === 0 ? 'Almuerzo' : 'Cena',
            15 + (i % 5) + (j % 5), // Tiempo de prep aleatorio controlado
            300 + (i * 8) + (j * 7), // Calorías variables
            20 + i, 30 + (j % 10), 10 + (i % 5),
            `${proteinas[i]}, ${bases[j]}, 1 cda aceite de oliva, sal marina, especias al gusto, vegetales frescos.`,
            `1. Prepara tu base de ${bases[j]}. 2. Cocina el ingrediente principal: ${proteinas[i]}. 3. Mezcla en un bowl, añade el aceite y sazona al gusto. ¡Ideal para nutrirte tras el ayuno!`,
            '🥗'
          ]
        );
      }
    }

    // 3. Generador de 400 Artículos (20 Temas x 20 Enfoques)
    const temas = ['Autofagia', 'Sensibilidad a la Insulina', 'Hormona del Crecimiento', 'Metabolismo Basal', 'Cetosis', 'Microbiota Intestinal', 'Niveles de Energía', 'Calidad del Sueño', 'Manejo del Estrés', 'Hidratación Celular', 'Claridad Mental', 'Reducción de Inflamación', 'Regeneración Celular', 'Ciclo Circadiano', 'Flexibilidad Metabólica', 'Salud Cardiovascular', 'Envejecimiento Saludable', 'Desintoxicación Natural', 'Hormonas del Hambre', 'Masa Muscular'];
    const enfoques = ['para principiantes', 'en ayuno 16/8', 'a nivel celular', 'desmintiendo mitos', 'beneficios clave', 'guía práctica', 'según la ciencia', 'errores comunes', 'cómo optimizarlo', 'y longevidad', 'para mujeres', 'para deportistas', 'paso a paso', 'en ayuno prolongado', 'verdades ocultas', 'y bienestar emocional', 'estrategias avanzadas', 'mitos y realidades', 'cómo empezar hoy', 'y pérdida de grasa'];
    
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        await pool.query(
          `INSERT INTO learning_articles (title, summary, content, read_time, category)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            `${temas[i]} ${enfoques[j]}`,
            `Descubre cómo el ayuno impacta tu ${temas[i].toLowerCase()} con este enfoque ${enfoques[j]}.`,
            `El concepto de ${temas[i]} es fundamental en tu proceso nutricional. Cuando lo analizamos ${enfoques[j]}, descubrimos adaptaciones biológicas fascinantes. Mantener consistencia en tus hábitos potencia estos resultados.`,
            3 + (j % 4), // Tiempo de lectura variable
            'Academia del Ayuno'
          ]
        );
      }
    }

    return NextResponse.json({ success: true, message: '¡400 recetas y 400 artículos generados exitosamente en la base de datos!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
