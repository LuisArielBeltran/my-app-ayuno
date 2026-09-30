export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // 1. Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Verificar si el usuario ya existe en la base de datos
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userCheck.rows.length > 0) {
      const user = userCheck.rows[0];
      
      // Si el usuario existe pero NO tiene contraseña (viene del Onboarding)
      if (!user.password || user.password.trim() === '') {
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
        return NextResponse.json({ success: true, message: 'Contraseña asignada exitosamente' });
      } else {
        // Si ya tiene contraseña, entonces sí es un usuario que intenta registrarse dos veces
        return NextResponse.json({ error: 'El usuario ya está registrado. Por favor, inicia sesión.' }, { status: 400 });
      }
    } else {
      // 3. Si no existe en absoluto, lo creamos desde cero
      await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2)',
        [email, hashedPassword]
      );
      return NextResponse.json({ success: true, message: 'Usuario creado exitosamente' });
    }
  } catch (error: any) {
    console.error('Error en registro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
