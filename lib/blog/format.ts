const DATE = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });

export function formatPublishDate(d: Date): string {
  return DATE.format(d);
}

export function formatReadingTime(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min read`;
}
