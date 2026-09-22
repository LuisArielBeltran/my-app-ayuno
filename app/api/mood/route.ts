import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });

  try {
    const result = await pool.query(
      'SELECT mood_score, energy_level, symptoms FROM mood_log WHERE email = $1 AND log_date = CURRENT_DATE',
      [email]
    );
    return NextResponse.json({ mood: result.rows[0] || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, moodScore, energyLevel, symptoms } = await request.json();

    await pool.query(
      `INSERT INTO mood_log (email, mood_score, energy_level, symptoms, log_date) 
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       ON CONFLICT (email, log_date) 
       DO UPDATE SET mood_score = $2, energy_level = $3, symptoms = $4`,
      [email, moodScore, energyLevel, symptoms]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}