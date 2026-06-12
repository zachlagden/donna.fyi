interface Props { id: string; }

export function Loom({ id }: Props) {
  return (
    <div className="my-6 aspect-video rounded-sm overflow-hidden border border-rule">
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
