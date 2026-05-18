import Link from "next/link";
import { ArrowUpRight, KeyRound, BookOpen, LogOut } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/nextauth";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

interface Row {
  num: string;
  title: string;
  description: string;
  href?: string;
  icon: typeof KeyRound;
}

const ROWS: Row[] = [
  {
    num: "01",
    title: "API keys",
    description: "Mint, list, and revoke bearer tokens. Donna and Zach each post via their own key.",
    href: "/admin/keys",
    icon: KeyRound,
  },
  {
    num: "02",
    title: "API docs",
    description: "Reference for /api/v1. Copyable as a system prompt for AI agents.",
    href: "/admin/docs",
    icon: BookOpen,
  },
];

export default async function AdminHome() {
  const session = await requireSession();
  const login =
    (session.user as { githubLogin?: string } | undefined)?.githubLogin ??
    session.user?.name ??
    "signed in";

  return (
    <main className="max-w-3xl mx-auto px-6 pt-32 pb-32">
      <p
        style={{ fontFamily: "var(--font-geist-mono)" }}
        className="text-[11px] tracking-[0.22em] uppercase text-zinc-600 mb-3"
      >
        donna.fyi · admin
      </p>
      <h1
        className="text-4xl md:text-5xl font-semibold text-zinc-100 tracking-tight"
        style={{ fontFamily: "var(--font-newsreader)" }}
      >
        Signed in as <span className="text-violet-300">{login}</span>.
      </h1>
      <p className="text-zinc-500 mt-4 max-w-xl leading-relaxed">
        The only admin surface lives here. Keys, docs, sign out. Everything else runs through the API.
      </p>

      <ul className="mt-16 border-t border-zinc-900">
        {ROWS.map((r) => {
          const Icon = r.icon;
          return (
            <li key={r.num} className="border-b border-zinc-900">
              <Link
                href={r.href!}
                className="group relative flex items-baseline gap-6 py-7 transition-colors hover:bg-zinc-950/60"
              >
                <span
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                  className="text-xs text-zinc-700 group-hover:text-zinc-500 transition-colors tabular-nums w-6 shrink-0"
                >
                  {r.num}
                </span>
                <Icon className="w-4 h-4 text-zinc-600 group-hover:text-violet-300 transition-colors self-center" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-xl md:text-2xl text-zinc-100 group-hover:text-white transition-colors leading-tight"
                    style={{ fontFamily: "var(--font-newsreader)" }}
                  >
                    {r.title}
                  </h2>
                  <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors mt-1.5 leading-relaxed">
                    {r.description}
                  </p>
                </div>
                <ArrowUpRight
                  className="w-5 h-5 text-zinc-700 self-center -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-violet-300 transition-[transform,opacity,color] duration-200 ease-out"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          );
        })}
        <li className="border-b border-zinc-900">
          <form action={logoutAction}>
            <button
              type="submit"
              className="group relative w-full text-left flex items-baseline gap-6 py-7 hover:bg-zinc-950/60 cursor-pointer active:scale-[0.99]"
              style={{ transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 200ms ease-out" }}
            >
              <span
                style={{ fontFamily: "var(--font-geist-mono)" }}
                className="text-xs text-zinc-700 group-hover:text-zinc-500 transition-colors tabular-nums w-6 shrink-0"
              >
                03
              </span>
              <LogOut className="w-4 h-4 text-zinc-600 group-hover:text-red-400 transition-colors self-center" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl md:text-2xl text-zinc-100 group-hover:text-white transition-colors leading-tight"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  Sign out
                </h2>
                <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors mt-1.5 leading-relaxed">
                  Clear the session cookie and return to the home page.
                </p>
              </div>
              <span
                style={{ fontFamily: "var(--font-geist-mono)" }}
                className="text-[11px] uppercase tracking-wider text-zinc-700 self-center opacity-0 group-hover:opacity-100 group-hover:text-red-400/80 transition-opacity duration-200"
              >
                confirm
              </span>
            </button>
          </form>
        </li>
      </ul>

      <p
        style={{ fontFamily: "var(--font-geist-mono)" }}
        className="text-[11px] text-zinc-700 mt-12 tracking-wide"
      >
        single-user instance · bootstrap login locked to {process.env.BOOTSTRAP_ALLOWED_GITHUB_LOGIN ?? "zachlagden"}
      </p>
    </main>
  );
}
