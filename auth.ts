import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { env } from "@/lib/env";

/** Next-Auth v5 configuration restricted to the repo owner's GitHub account. */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    signIn: async ({ profile }) => {
      const login = (profile as { login?: string } | undefined)?.login;
      return !!login && login.toLowerCase() === env.GITHUB_USERNAME.toLowerCase();
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});
