import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

// Forzamos un valor por defecto seguro si la variable no existe en tiempo de build
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('http') 
  ? process.env.NEXTAUTH_URL 
  : 'https://my-app-ayuno-git-main-luisarielbeltrans-projects.vercel.app';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Faltan datos");
        }

        // Buscar al usuario en la base de datos
        const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [credentials.email]);
        const user = userRes.rows[0];

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        // Comparar la contraseña encriptada
        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        return { id: user.id.toString(), email: user.email };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "mi_secreto_super_seguro_123",
});

export { handler as GET, handler as POST };
