"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSurahList } from "../../lib/quranApi";
import { filterSurahs, type SurahLite } from "../../lib/search";

export default function SurahIndex() {
  const [surahs, setSurahs] = useState<SurahLite[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    getSurahList().then(setSurahs).catch(() => setError(true));
  }, []);

  const filtered = useMemo(() => filterSurahs(surahs, q), [surahs, q]);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-32 pt-6">
      <h1 className="text-2xl font-bold">Daftar Surah</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari surah (nama, nomor, Arab)…"
        className="mt-4 w-full rounded-full bg-surface2 px-4 py-2.5 text-sm outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-accent"
      />
      {error && <p className="mt-4 text-sm text-red-400">Gagal memuat daftar surah. Coba muat ulang.</p>}
      <ul className="mt-4 space-y-1">
        {filtered.map((s) => (
          <li key={s.id}>
            <Link
              href={`/surah/${s.id}`}
              className="flex items-center gap-4 rounded-lg px-2 py-2.5 transition hover:bg-surface"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-accent/20 text-sm font-semibold text-accent">
                {s.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{s.nameSimple}</span>
                <span className="block truncate text-xs text-neutral-400">
                  {s.revelationPlace === "makkah" ? "Makkiyah" : "Madaniyah"} · {s.ayahCount} ayat · {s.translatedName}
                </span>
              </span>
              <span className="rtl shrink-0 font-amiri text-xl">{s.nameArabic}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
