interface Props { id: string; title?: string; }

export function YouTube({ id, title = "YouTube video" }: Props) {
  return (
    <div className="my-6 aspect-video rounded-lg overflow-hidden border border-zinc-800/60">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
