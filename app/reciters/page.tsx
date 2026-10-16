"use client";

import { useEffect, useState } from "react";
import { getReciters, type Reciter } from "../../lib/quranApi";
import { getSettings, saveSettings } from "../../lib/store";

export default function Reciters() {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getReciters().then(setReciters).catch(() => setError(true));
    setActiveId(getSettings().reciterId);
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-32 pt-6">
      <h1 className="text-2xl font-bold">Pilih Qari</h1>
      <p className="mt-1 text-sm text-neutral-400">Qari aktif dipakai di seluruh aplikasi.</p>
      {error && <p className="mt-4 text-sm text-red-400">Gagal memuat daftar qari.</p>}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {reciters.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              saveSettings({ reciterId: r.id });
              setActiveId(r.id);
              if (typeof window !== "undefined") window.location.reload();
            }}
            className={`rounded-xl p-4 text-left transition ${
              activeId === r.id
                ? "bg-accent/20 ring-2 ring-accent"
                : "bg-surface hover:bg-surface2"
            }`}
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/30 text-xl">
              🎧
            </div>
            <p className="truncate text-sm font-medium">{r.name}</p>
            <p className="mt-0.5 truncate text-xs text-neutral-400">{r.relativePath}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
