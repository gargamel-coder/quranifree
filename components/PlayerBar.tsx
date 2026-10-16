"use client";

import { useState } from "react";
import { usePlayer } from "./PlayerProvider";

const SPEEDS = [1, 1.25, 1.5, 2];

export default function PlayerBar({ ayahCount }: { ayahCount: number }) {
  const {
    state,
    play,
    pause,
    resume,
    next,
    prev,
    setSpeed,
    setSleepTimer,
    enableStopAtSurahEnd,
    toggleRepeatAyah,
    setFocusMode,
    toast,
  } = usePlayer();
  const [showSleep, setShowSleep] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const currentSpeedIdx = Math.max(0, SPEEDS.indexOf(state.speed));

  return (
    <>
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full bg-surface2 px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-white/10">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2">
          {/* left: current */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Surah {state.surah} · Ayat {state.ayah}</p>
            <p className="truncate text-xs text-neutral-400">Quranifree</p>
          </div>

          {/* center: controls */}
          <div className="flex items-center gap-2">
            <button aria-label="Sebelumnya" onClick={prev} className="p-2 text-xl">⏮</button>
            {state.playing ? (
              <button aria-label="Pause" onClick={pause} className="rounded-full bg-accent p-3 text-black">⏸</button>
            ) : (
              <button aria-label="Putar" onClick={resume} className="rounded-full bg-accent p-3 text-black">▶</button>
            )}
            <button aria-label="Berikutnya" onClick={() => next(ayahCount)} className="p-2 text-xl">⏭</button>
          </div>

          {/* right: options */}
          <div className="flex items-center gap-1">
            <button
              aria-label="Ulangi ayat"
              onClick={toggleRepeatAyah}
              className={`p-2 ${state.repeatAyah ? "text-accent" : "text-neutral-400"}`}
              title="Ulangi ayat"
            >🔁</button>
            <button
              aria-label="Mode fokus"
              onClick={() => setFocusMode(true)}
              className="p-2 text-neutral-400"
              title="Mode fokus"
            >⛶</button>
            <button
              aria-label="Kecepatan"
              onClick={() => setSpeed(SPEEDS[(currentSpeedIdx + 1) % SPEEDS.length])}
              className="p-2 text-xs text-neutral-300"
            >{state.speed}×</button>
            <div className="relative">
              <button
                aria-label="Timer tidur"
                onClick={() => setShowSleep((v) => !v)}
                className={`p-2 ${state.sleepTimerMinutes !== null ? "text-accent" : "text-neutral-400"}`}
              >🌙</button>
              {showSleep && (
                <div className="absolute bottom-full right-0 mb-2 w-40 rounded-lg bg-surface2 p-2 shadow-xl">
                  {[15, 30, 60].map((m) => (
                    <button
                      key={m}
                      className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-white/10"
                      onClick={() => { setSleepTimer(m); setShowSleep(false); }}
                    >{m} menit</button>
                  ))}
                  <button
                    className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-white/10"
                    onClick={() => { enableStopAtSurahEnd(); setSleepTimer(null); setShowSleep(false); }}
                  >Sampai akhir surah</button>
                  <button
                    className="block w-full rounded px-2 py-1.5 text-left text-sm text-neutral-400 hover:bg-white/10"
                    onClick={() => { setSleepTimer(null); setShowSleep(false); }}
                  >Matikan</button>
                </div>
              )}
            </div>
            <button
              aria-label="Antrian"
              onClick={() => setShowQueue((v) => !v)}
              className="p-2 text-neutral-400"
            >☰</button>
          </div>
        </div>
        {showQueue && (
          <div className="mx-auto max-h-48 max-w-4xl overflow-y-auto border-t border-white/10 px-4 py-2">
            {Array.from({ length: ayahCount }, (_, i) => i + 1)
              .filter((a) => a >= state.ayah)
              .map((a) => (
                <button
                  key={a}
                  className={`block w-full rounded px-2 py-1 text-left text-sm hover:bg-white/10 ${a === state.ayah ? "text-accent" : ""}`}
                  onClick={() => { play(state.surah, a); setShowQueue(false); }}
                >Ayat {a}</button>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
