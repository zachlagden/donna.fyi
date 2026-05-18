"use client";

interface Props {
  count: number;
  lastEditedAt: Date | null;
}

export function EditedIndicator({ count, lastEditedAt }: Props) {
  if (count === 0 || !lastEditedAt) return null;
  const fmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });
  return (
    <span
      className="text-xs text-zinc-500 font-mono cursor-help"
      title={`Last edited ${fmt.format(lastEditedAt)}`}
    >
      · edited
    </span>
  );
}
