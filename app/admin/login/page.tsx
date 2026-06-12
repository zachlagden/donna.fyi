import { signIn } from "@/lib/auth/nextauth";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="max-w-md mx-auto px-6 pt-32 pb-12">
      <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint mb-3">
        donna.fyi · admin
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink mb-3">
        Admin sign-in
      </h1>
      <p className="text-ink-muted mb-8 text-sm">
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
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-panel border border-rule hover:border-rule-strong text-ink transition-colors"
        >
          <Github className="w-4 h-4" />
          Continue with GitHub
        </button>
      </form>
    </main>
  );
}
