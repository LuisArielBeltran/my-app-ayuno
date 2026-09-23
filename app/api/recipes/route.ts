export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Calcular el día del año actual (1 a 365/366)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    
    // Consultar el total de recetas para hacer una rotación segura y evitar desbordamientos de offset
    const countRes = await pool.query('SELECT COUNT(*) FROM recipes');
    const totalRecipes = parseInt(countRes.rows[0].count, 10) || 1;

    // Rotar de manera segura según el total de recetas disponibles
    const offset = dayOfYear % totalRecipes;

    // Traemos 3 recetas rotativas para ofrecer opciones en el día
    const res = await pool.query('SELECT * FROM recipes ORDER BY id ASC LIMIT 3 OFFSET $1', [offset]);
    
    return NextResponse.json({ success: true, recipes: res.rows });
  } catch (error: any) {
    console.error('Error al obtener recetas rotativas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
