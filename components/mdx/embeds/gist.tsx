interface Props { id: string; }

export function Gist({ id }: Props) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-zinc-800/60">
      <iframe
        src={`https://gist.github.com/${id}.pibb`}
        title="GitHub Gist"
        loading="lazy"
        className="w-full min-h-[200px]"
      />
    </div>
  );
}
