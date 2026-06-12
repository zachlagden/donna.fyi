import { Info, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface CalloutProps { children: ReactNode; }

function Callout({
  children,
  Icon,
  bgClass,
  accentClass,
  label,
  serif,
}: {
  children: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  bgClass?: string;
  accentClass: string;
  label: string;
  serif?: boolean;
}) {
  return (
    <div className={`my-6 rounded-sm border border-rule ${bgClass ?? ""} p-4 flex gap-3`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${accentClass}`} />
      <div className="flex-1">
        <p className={`font-mono text-[10px] tracking-[0.16em] uppercase mb-1.5 ${accentClass}`}>{label}</p>
        <div
          className="text-ink leading-relaxed"
          style={serif ? { fontFamily: "var(--font-newsreader)" } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function Note({ children }: CalloutProps) {
  return <Callout Icon={Info} accentClass="text-ink-muted" label="Note">{children}</Callout>;
}
export function Warning({ children }: CalloutProps) {
  return <Callout Icon={AlertTriangle} accentClass="text-author-zach" label="Warning">{children}</Callout>;
}
export function Tip({ children }: CalloutProps) {
  return <Callout Icon={Lightbulb} accentClass="text-accent-c" label="Tip">{children}</Callout>;
}
export function DonnaSays({ children }: CalloutProps) {
  return <Callout Icon={Sparkles} bgClass="bg-author-donna-soft" accentClass="text-author-donna" label="Donna says" serif>{children}</Callout>;
}
export function ZachSays({ children }: CalloutProps) {
  return <Callout Icon={Sparkles} bgClass="bg-author-zach-soft" accentClass="text-author-zach" label="Zach says" serif>{children}</Callout>;
}
