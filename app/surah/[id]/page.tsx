"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSurahList, getAyahs, resolveReciterFolder, type Ayah } from "../../../lib/quranApi";
import { isFavorite, toggleFavorite, getSettings } from "../../../lib/store";
import { PlayerProvider, usePlayer } from "../../../components/PlayerProvider";
import PlayerBar from "../../../components/PlayerBar";
import FocusMode from "../../../components/FocusMode";

function Reader({ surahId }: { surahId: number }) {
  const { play, state, pause, focusMode } = usePlayer();
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [name, setName] = useState<{ simple: string; arabic: string; translated: string } | null>(null);
  const [error, setError] = useState(false);
  const [favTick, setFavTick] = useState(0);

  useEffect(() => {
    getSurahList().then((list) => {
      const s = list.find((x) => x.id === surahId);
      if (s) setName({ simple: s.nameSimple, arabic: s.nameArabic, translated: s.translatedName });
    }).catch(() => {});
    getAyahs(surahId).then(setAyahs).catch(() => setError(true));
  }, [surahId]);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-40 pt-0">
      {/* Spotify-style header */}
      <div className="bg-gradient-to-b from-accent/40 to-transparent px-4 pb-6 pt-16">
        <div className="rtl font-amiri text-5xl">{name?.arabic ?? "…"}</div>
        <h1 className="mt-2 text-3xl font-bold">{name?.simple ?? "…"}</h1>
        <p className="text-sm text-neutral-300">{name?.translated} · {ayahs.length || "…"} ayat</p>
        <button
          onClick={() => ayahs.length > 0 && play(surahId, 1)}
          className="mt-4 rounded-full bg-accent px-6 py-2.5 font-semibold text-black hover:brightness-110"
        >
          ▶ Play
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">Gagal memuat ayat. Periksa koneksi lalu muat ulang.</p>}

      <ul className="mt-4 space-y-2">
        {ayahs.map((a) => {
          const active = state.surah === surahId && state.ayah === a.id;
          const fav = isFavorite(surahId, a.id);
          return (
            <li
              key={a.id}
              id={`ayah-${a.id}`}
              className={`rounded-xl p-4 transition ${active ? "bg-accent/15 ring-1 ring-accent/50" : "bg-surface hover:bg-surface2"}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-accent text-xs font-bold text-black">
                  {a.id}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    aria-label="Putar ayat"
                    className="p-1.5"
                    onClick={() => (active && state.playing ? pause() : play(surahId, a.id))}
                  >
                    {active && state.playing ? "⏸" : "▶"}
                  </button>
                  <button
                    aria-label="Favorit"
                    className={`p-1.5 ${fav ? "text-accent" : "text-neutral-500"}`}
                    onClick={() => {
                      toggleFavorite({ surah: surahId, ayah: a.id, text: a.textUthmani });
                      setFavTick((n) => n + 1);
                    }}
                  >
                    {fav ? "♥" : "♡"}
                  </button>
                </div>
              </div>
              <p className="rtl mt-3 text-right font-amiri text-2xl leading-loose" dir="rtl" lang="ar">
                {a.textUthmani}
              </p>
              <p className="mt-2 text-sm text-neutral-300">{a.translation}</p>
            </li>
          );
        })}
      </ul>
      {favTick < 0 && <span />}
      {focusMode && <FocusMode ayahCount={ayahs.length} />}
      <div className="mt-8 text-center">
        <Link href="/surah" className="text-sm text-neutral-400 hover:text-white">← Semua surah</Link>
      </div>
    </main>
  );
}

export default function SurahPage({ params }: { params: { id: string } }) {
  const surahId = Number(params.id);
  const [folder, setFolder] = useState<string | null>(null);
  const [ayahCount, setAyahCount] = useState(0);

  useEffect(() => {
    resolveReciterFolder(getSettings().reciterId).then(setFolder);
    getAyahs(surahId).then((a) => setAyahCount(a.length)).catch(() => {});
  }, [surahId]);

  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) {
    return <main className="p-8 text-center">Surah tidak ditemukan.</main>;
  }
  if (folder === null) {
    return <main className="p-8 text-center text-neutral-400">Memuat…</main>;
  }
  return (
    <PlayerProvider reciterFolder={folder}>
      <Reader surahId={surahId} />
      <PlayerBar ayahCount={ayahCount || 114} />
    </PlayerProvider>
  );
}
