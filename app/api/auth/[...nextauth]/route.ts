import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const cleanEmail = credentials.email.toLowerCase().trim();

          // 1. Buscar el usuario en la base de datos de Railway
          const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
          if (result.rows.length === 0) {
            return null; // Usuario no encontrado
          }

          const user = result.rows[0];

          // 2. Comparar la contraseña ingresada con el hash de la base de datos
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            return null; // Contraseña incorrecta
          }

          // 3. Retornar el objeto de usuario autorizado para crear la sesión
          return {
            id: String(user.id),
            email: user.email,
          };
        } catch (error) {
          console.error("Error en el proceso de autorización de NextAuth:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
