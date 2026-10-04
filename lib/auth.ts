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

          const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
          if (result.rows.length === 0) {
            return null;
          }

          const user = result.rows[0];
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

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
