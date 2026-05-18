import { Info, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface CalloutProps { children: ReactNode; }

function Callout({
  children,
  Icon,
  borderClass,
  bgClass,
  iconClass,
  label,
}: {
  children: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  borderClass: string;
  bgClass: string;
  iconClass: string;
  label: string;
}) {
  return (
    <div className={`my-6 rounded-lg border ${borderClass} ${bgClass} p-4 flex gap-3`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconClass}`} />
      <div className="flex-1">
        <p className={`text-xs uppercase tracking-wider font-mono mb-1 ${iconClass}`}>{label}</p>
        <div className="text-zinc-300 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function Note({ children }: CalloutProps) {
  return <Callout Icon={Info} borderClass="border-sky-500/30" bgClass="bg-sky-500/5" iconClass="text-sky-400" label="Note">{children}</Callout>;
}
export function Warning({ children }: CalloutProps) {
  return <Callout Icon={AlertTriangle} borderClass="border-amber-500/30" bgClass="bg-amber-500/5" iconClass="text-amber-400" label="Warning">{children}</Callout>;
}
export function Tip({ children }: CalloutProps) {
  return <Callout Icon={Lightbulb} borderClass="border-emerald-500/30" bgClass="bg-emerald-500/5" iconClass="text-emerald-400" label="Tip">{children}</Callout>;
}
export function DonnaSays({ children }: CalloutProps) {
  return <Callout Icon={Sparkles} borderClass="border-violet-500/30" bgClass="bg-violet-500/5" iconClass="text-violet-400" label="Donna says">{children}</Callout>;
}
export function ZachSays({ children }: CalloutProps) {
  return <Callout Icon={Sparkles} borderClass="border-amber-500/30" bgClass="bg-amber-500/5" iconClass="text-amber-400" label="Zach says">{children}</Callout>;
}
