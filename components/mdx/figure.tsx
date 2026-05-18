"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function Figure({ src, alt, caption, width = 1600, height = 900 }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <figure className="my-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full rounded-lg overflow-hidden border border-zinc-800/60 cursor-zoom-in"
        aria-label="Open image at full size"
      >
        <Image src={src} alt={alt} width={width} height={height} className="w-full h-auto" />
      </button>
      {caption && (
        <figcaption className="text-sm text-zinc-500 italic text-center mt-3" style={{ fontFamily: "var(--font-newsreader)" }}>
          {caption}
        </figcaption>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <Image src={src} alt={alt} width={width} height={height} className="max-w-full max-h-full w-auto h-auto" />
        </div>
      )}
    </figure>
  );
}
