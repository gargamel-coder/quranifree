"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFavorites, toggleFavorite } from "../../lib/store";

export default function Library() {
  const [favs, setFavs] = useState<{ surah: number; ayah: number; text: string }[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setFavs(getFavorites());
  }, [refresh]);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-32 pt-6">
      <h1 className="text-2xl font-bold">Pustaka</h1>
      {favs.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-400">
          Belum ada ayat favorit. Tandai ayat dengan ikon ♥ di halaman surah.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {favs.map((f) => (
            <li key={`${f.surah}-${f.ayah}`} className="flex items-center gap-3 rounded-lg bg-surface p-3">
              <Link href={`/surah/${f.surah}#ayah-${f.ayah}`} className="min-w-0 flex-1">
                <span className="block text-xs text-accent">QS {f.surah}:{f.ayah}</span>
                <span className="rtl block truncate font-amiri text-lg">{f.text}</span>
              </Link>
              <button
                aria-label="Hapus favorit"
                className="p-2 text-neutral-400 hover:text-red-400"
                onClick={() => {
                  toggleFavorite(f);
                  setRefresh((n) => n + 1);
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
