import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 1. Crear la tabla de artículos si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS learning_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        read_time INT NOT NULL,
        category VARCHAR(50) NOT NULL
      );
    `);

    // 2. Verificar si hay artículos; si no hay, inyectar los iniciales
    const check = await pool.query('SELECT COUNT(*) FROM learning_articles');
    
    if (parseInt(check.rows[0].count) === 0) {
      const defaultArticles = [
        { 
          title: "El Poder de la Autofagia", 
          summary: "Cómo tu cuerpo se repara a nivel celular.", 
          content: "Después de 14-16 horas de ayuno, tu cuerpo agota sus reservas de glucógeno y comienza un proceso de 'reciclaje' llamado autofagia. Las células destruyen proteínas dañadas y toxinas, promoviendo la longevidad y reduciendo la inflamación.", 
          read_time: 3, 
          category: "Ciencia" 
        },
        { 
          title: "Rompiendo el Ayuno Estratégicamente", 
          summary: "Qué comer para no disparar la insulina.", 
          content: "El error más común es romper el ayuno con carbohidratos refinados o azúcares, lo que causa un pico drástico de insulina. La regla de oro es comenzar con proteínas magras y grasas saludables (como huevos o palta) para mantener la estabilidad metabólica.", 
          read_time: 2, 
          category: "Nutrición" 
        },
        { 
          title: "Hidratación: La Trampa de los Electrolitos", 
          summary: "Por qué tomar solo agua no es suficiente.", 
          content: "Durante el ayuno, la caída de insulina hace que los riñones excreten más sodio y agua. Esto causa dolor de cabeza y fatiga. Añadir una pizca de sal marina o un suplemento de electrolitos sin azúcar al agua previene estos síntomas por completo.", 
          read_time: 2, 
          category: "Consejos" 
        }
      ];

      for (const art of defaultArticles) {
        await pool.query(
          'INSERT INTO learning_articles (title, summary, content, read_time, category) VALUES ($1, $2, $3, $4, $5)',
          [art.title, art.summary, art.content, art.read_time, art.category]
        );
      }
    }

    // 3. Devolver los artículos a la interfaz
    const result = await pool.query('SELECT * FROM learning_articles ORDER BY id ASC');
    return NextResponse.json({ articles: result.rows });
  } catch (error: any) {
    console.error('Error en Centro de Aprendizaje:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}