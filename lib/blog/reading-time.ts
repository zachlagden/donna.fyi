const WORDS_PER_MINUTE = 250;

export function readingTimeSeconds(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.round((words / WORDS_PER_MINUTE) * 60);
}
