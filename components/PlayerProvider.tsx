"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  initialState,
  next as machineNext,
  prev as machinePrev,
  setPlaying,
  setSleepTimer,
  setSpeed,
  toggleRepeat,
  enableStopAtSurahEnd,
  type PlayerState,
} from "../lib/playerMachine";
import { ayahAudioUrl } from "../lib/quranApi";
import { getSettings, saveSettings, setLastRead } from "../lib/store";

type PlayerContextValue = {
  state: PlayerState;
  reciterFolder: string;
  play: (surah: number, ayah: number) => void;
  pause: () => void;
  resume: () => void;
  next: (ayahCount: number) => void;
  prev: () => void;
  setSpeed: (x: number) => void;
  setSleepTimer: (min: number | null) => void;
  enableStopAtSurahEnd: () => void;
  toggleRepeatAyah: () => void;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({
  children,
  reciterFolder,
}: {
  children: React.ReactNode;
  reciterFolder: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>(() =>
    initialState(1, 1)
  );
  const [focusMode, setFocusMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const folderRef = useRef(reciterFolder);
  folderRef.current = reciterFolder;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // create audio element client-side
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const loadAndPlay = useCallback((surah: number, ayah: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = ayahAudioUrl(folderRef.current, surah, ayah);
    audio.playbackRate = state.speed;
    audio.play().catch(() => {
      showToast("Audio tidak dapat diputar");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.speed, showToast]);

  const play = useCallback(
    (surah: number, ayah: number) => {
      setState((s) => ({ ...s, surah, ayah, playing: true }));
      loadAndPlay(surah, ayah);
      setLastRead(surah, ayah);
    },
    [loadAndPlay]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((s) => setPlaying(s, false));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    setState((s) => setPlaying(s, true));
  }, []);

  const advance = useCallback(
    (ayahCount: number) => {
      setState((s) => {
        const n = machineNext(s, ayahCount);
        const audio = audioRef.current;
        if (audio) {
          if (s.repeatAyah && n.playing) {
            // replay same ayah
            audio.currentTime = 0;
            audio.play().catch(() => {});
          } else if (n.ayah !== s.ayah && n.playing) {
            audio.src = ayahAudioUrl(folderRef.current, n.surah, n.ayah);
            audio.playbackRate = n.speed;
            audio.play().catch(() => {});
          } else if (!n.playing) {
            audio.pause();
          }
        }
        if (n.ayah !== s.ayah || n.surah !== s.surah) {
          setLastRead(n.surah, n.ayah);
        }
        return n;
      });
    },
    []
  );

  const next = useCallback(
    (ayahCount: number) => {
      advance(ayahCount);
    },
    [advance]
  );

  const prev = useCallback(() => {
    setState((s) => {
      const p = machinePrev(s);
      const audio = audioRef.current;
      if (audio && p.ayah !== s.ayah) {
        audio.src = ayahAudioUrl(folderRef.current, p.surah, p.ayah);
        audio.playbackRate = p.speed;
        audio.play().catch(() => {});
      }
      return p;
    });
  }, []);

  const handleSpeed = useCallback((x: number) => {
    setState((s) => setSpeed(s, x));
    if (audioRef.current) audioRef.current.playbackRate = x;
    saveSettings({ speed: x });
  }, []);

  const handleSleepTimer = useCallback((min: number | null) => {
    setState((s) => setSleepTimer(s, min));
  }, []);

  const handleStopAtSurahEnd = useCallback(() => {
    setState((s) => enableStopAtSurahEnd(s));
  }, []);

  const handleToggleRepeat = useCallback(() => {
    setState((s) => toggleRepeat(s));
  }, []);

  // sleep timer ticker: every 60s while playing with an active timer
  useEffect(() => {
    if (state.sleepTimerMinutes === null || !state.playing) return;
    const id = setInterval(() => {
      setState((s) => {
        if (s.sleepTimerMinutes === null) return s;
        const total = s.sleepElapsedMinutes + 1;
        if (total >= s.sleepTimerMinutes) {
          audioRef.current?.pause();
          return { ...s, playing: false, sleepTimerMinutes: null, sleepElapsedMinutes: 0 };
        }
        return { ...s, sleepElapsedMinutes: total };
      });
    }, 60_000);
    return () => clearInterval(id);
  }, [state.sleepTimerMinutes, state.playing]);

  // audio ended handler: repeat → replay; stop-at-end → handled by machine; else advance
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setState((s) => {
        if (s.repeatAyah) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
          return s;
        }
        return { ...s, _ended: true } as PlayerState & { _ended?: boolean };
      });
    };
    const onError = () => {
      showToast("Audio ayat ini tidak tersedia, lanjut ke ayat berikutnya");
      setState((s) => ({ ...s, _skip: true } as PlayerState & { _skip?: boolean }));
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [showToast]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const value = useMemo<PlayerContextValue>(
    () => ({
      state,
      reciterFolder,
      play,
      pause,
      resume,
      next,
      prev,
      setSpeed: handleSpeed,
      setSleepTimer: handleSleepTimer,
      enableStopAtSurahEnd: handleStopAtSurahEnd,
      toggleRepeatAyah: handleToggleRepeat,
      focusMode,
      setFocusMode,
      toast,
      showToast,
    }),
    [
      state,
      reciterFolder,
      play,
      pause,
      resume,
      next,
      prev,
      handleSpeed,
      handleSleepTimer,
      handleStopAtSurahEnd,
      handleToggleRepeat,
      focusMode,
      toast,
      showToast,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
