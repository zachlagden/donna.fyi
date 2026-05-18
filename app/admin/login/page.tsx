import { signIn } from "@/lib/auth/nextauth";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="max-w-md mx-auto px-6 pt-32 pb-12">
      <h1 className="text-3xl font-bold text-zinc-100 mb-3" style={{ fontFamily: "var(--font-newsreader)" }}>
        Admin sign-in
      </h1>
      <p className="text-zinc-500 mb-8 text-sm">
        Locked to a single GitHub account.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/admin" });
        }}
      >
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 transition-colors"
        >
          <Github className="w-4 h-4" />
          Continue with GitHub
        </button>
      </form>
    </main>
  );
}
