"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSurahList, type Surah } from "../lib/quranApi";
import { getLastRead, getFavorites } from "../lib/store";
import { JUZ_STARTS } from "../lib/juzStarts";

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [lastRead, setLR] = useState<{ surah: number; ayah: number } | null>(null);
  const [favs, setFavs] = useState<{ surah: number; ayah: number; text: string }[]>([]);

  useEffect(() => {
    getSurahList().then(setSurahs).catch(() => {});
    setLR(getLastRead());
    setFavs(getFavorites().slice(0, 5));
  }, []);

  const lastSurah = lastRead ? surahs.find((s) => s.id === lastRead.surah) : null;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-32 pt-6">
      <h1 className="text-2xl font-bold">Quranifree</h1>
      <p className="mt-1 text-sm text-neutral-400">Al-Qur&apos;an murottal. Gratis, tanpa akun.</p>

      {lastRead && lastSurah && (
        <Link
          href={`/surah/${lastRead.surah}#ayah-${lastRead.ayah}`}
          className="mt-6 flex items-center gap-4 rounded-xl bg-surface2 p-4 transition hover:bg-white/10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent text-2xl text-black">▶</div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">Lanjutkan membaca</p>
            <p className="font-semibold">{lastSurah.nameSimple} · Ayat {lastRead.ayah}</p>
          </div>
        </Link>
      )}

      {favs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Favorit terbaru</h2>
          <ul className="space-y-1">
            {favs.map((f) => (
              <li key={`${f.surah}-${f.ayah}`}>
                <Link
                  href={`/surah/${f.surah}#ayah-${f.ayah}`}
                  className="block truncate rounded-lg bg-surface px-3 py-2 text-sm hover:bg-surface2"
                >
                  <span className="mr-2 text-accent">QS {f.surah}:{f.ayah}</span>
                  <span className="rtl font-amiri">{f.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Juz</h2>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {JUZ_STARTS.map((surahId, i) => (
            <Link
              key={i}
              href={`/surah/${surahId}`}
              className="flex aspect-square items-center justify-center rounded-lg bg-surface text-sm hover:bg-surface2"
            >
              {i + 1}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
