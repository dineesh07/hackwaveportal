import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // we add providers in auth.ts
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.rollNo = user.rollNo;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.rollNo = token.rollNo as string | undefined;
        session.user.role = token.role as string | undefined;
        session.user.mustChangePassword = token.mustChangePassword as boolean | undefined;
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
