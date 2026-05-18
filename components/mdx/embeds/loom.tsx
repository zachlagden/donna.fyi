interface Props { id: string; }

export function Loom({ id }: Props) {
  return (
    <div className="my-6 aspect-video rounded-lg overflow-hidden border border-zinc-800/60">
      <iframe
        src={`https://www.loom.com/embed/${id}`}
        title="Loom video"
        loading="lazy"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
