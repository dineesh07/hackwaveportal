import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rollNo?: string;
      role?: string;
      mustChangePassword?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    rollNo?: string;
    role?: string;
    mustChangePassword?: boolean;
  }
}
