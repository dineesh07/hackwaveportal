import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        rollNo: { label: "Roll Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.rollNo || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: { rollNo: { equals: credentials.rollNo as string, mode: 'insensitive' } }
        });

        if (!user) return null;

        if (user.status !== "ACTIVE") throw new Error("Account is inactive or locked.");

        const isMatch = await bcrypt.compare(credentials.password as string, user.passwordHash);

        if (!isMatch) return null;

        return {
          id: user.id,
          name: user.name,
          rollNo: user.rollNo,
          role: user.role,
          mustChangePassword: user.mustChangePassword
        };
      }
    })
  ]
});
