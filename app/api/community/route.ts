import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Obtenemos los últimos 20 mensajes de la comunidad
    const result = await pool.query(
      'SELECT id, email, protocol, message, likes, created_at FROM community_posts ORDER BY created_at DESC LIMIT 20'
    );
    return NextResponse.json({ posts: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, protocol, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO community_posts (email, protocol, message) VALUES ($1, $2, $3)',
      [email, protocol, message]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}