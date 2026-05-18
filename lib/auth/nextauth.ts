import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { sql } from "@/lib/db/client";
import { evaluateSignIn } from "./allowlist";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async signIn({ profile }) {
      if (!profile) return false;
      return evaluateSignIn({
        profile: {
          id: profile.id as unknown as number,
          login: profile.login as unknown as string,
          name: (profile.name as string) ?? null,
        },
        bootstrapLogin: process.env.BOOTSTRAP_ALLOWED_GITHUB_LOGIN,
        userExists: async (id) => {
          const r = await sql<{ ok: boolean }[]>`SELECT TRUE AS ok FROM users WHERE github_id = ${id}`;
          return r.length > 0;
        },
        userCount: async () => {
          const r = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM users`;
          return Number(r[0].count);
        },
        bootstrap: async ({ githubId, githubLogin, displayName }) => {
          await sql`INSERT INTO users (github_id, github_login, display_name, role) VALUES (${githubId}, ${githubLogin}, ${displayName}, 'owner')`;
        },
      });
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.githubId = (profile as { id?: number }).id;
        token.githubLogin = (profile as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { githubId?: number; githubLogin?: string }).githubId = token.githubId as number | undefined;
        (session.user as { githubId?: number; githubLogin?: string }).githubLogin = token.githubLogin as string | undefined;
      }
      return session;
    },
  },
});
