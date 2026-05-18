import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { sql } from "@/lib/db/client";

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
      const githubId = profile.id as number | undefined;
      const githubLogin = profile.login as string | undefined;
      if (!githubId || !githubLogin) return false;

      const existing = await sql<{ id: string }[]>`SELECT id FROM users WHERE github_id = ${githubId}`;
      if (existing.length > 0) return true;

      const count = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM users`;
      if (Number(count[0].count) === 0) {
        const allowed = process.env.BOOTSTRAP_ALLOWED_GITHUB_LOGIN;
        if (allowed && githubLogin === allowed) {
          await sql`
            INSERT INTO users (github_id, github_login, display_name, role)
            VALUES (${githubId}, ${githubLogin}, ${(profile.name as string) ?? githubLogin}, 'owner')
          `;
          return true;
        }
      }
      return false;
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
