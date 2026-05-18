import { formatPublishDate, formatReadingTime } from "@/lib/blog/format";
import { EditedIndicator } from "./edited-indicator";

interface Props {
  publishedAt: Date;
  readingTimeSeconds: number;
  revisionCount: number;
  lastEditedAt: Date | null;
}

export function PostMeta({ publishedAt, readingTimeSeconds, revisionCount, lastEditedAt }: Props) {
  return (
    <p className="text-sm text-zinc-500 font-mono">
      {formatPublishDate(publishedAt)} · {formatReadingTime(readingTimeSeconds)}
      <EditedIndicator count={revisionCount} lastEditedAt={lastEditedAt} />
    </p>
  );
}
