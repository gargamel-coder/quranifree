"use client";

import { usePlayer } from "./PlayerProvider";

export default function FocusMode({ ayahCount }: { ayahCount: number }) {
  const { state, setFocusMode, next, prev, pause, resume } = usePlayer();
  return (
    <div
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-base/95 p-8 backdrop-blur"
      onClick={() => setFocusMode(false)}
    >
      <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
        Surah {state.surah} · Ayat {state.ayah}
      </p>
      <p className="max-w-2xl text-center font-amiri text-3xl leading-loose sm:text-4xl">
        Ayat {state.ayah}
      </p>
      <div className="mt-10 flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Sebelumnya" onClick={prev} className="text-2xl">⏮</button>
        {state.playing ? (
          <button aria-label="Pause" onClick={pause} className="rounded-full bg-accent p-4 text-black">⏸</button>
        ) : (
          <button aria-label="Putar" onClick={resume} className="rounded-full bg-accent p-4 text-black">▶</button>
        )}
        <button aria-label="Berikutnya" onClick={() => next(ayahCount)} className="text-2xl">⏭</button>
      </div>
      <p className="mt-8 text-xs text-neutral-600">Ketuk di mana saja untuk menutup</p>
    </div>
  );
}
