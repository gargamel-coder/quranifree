export type PlayerState = {
  surah: number;
  ayah: number;
  playing: boolean;
  repeatAyah: boolean;
  speed: number;
  sleepTimerMinutes: number | null;
  sleepStopAtSurahEnd: boolean;
  sleepElapsedMinutes: number;
};

export function initialState(surah: number, ayah: number): PlayerState {
  return {
    surah,
    ayah,
    playing: true,
    repeatAyah: false,
    speed: 1,
    sleepTimerMinutes: null,
    sleepStopAtSurahEnd: false,
    sleepElapsedMinutes: 0,
  };
}

export function next(s: PlayerState, ayahCount: number): PlayerState {
  if (s.repeatAyah) {
    // repeat: replay same ayah (player provider re-seeks audio to 0)
    return { ...s, playing: true };
  }
  if (s.ayah >= ayahCount) {
    // end of surah: stop (never auto-advance to next surah)
    return { ...s, playing: false };
  }
  return { ...s, ayah: s.ayah + 1, playing: true };
}

export function prev(s: PlayerState): PlayerState {
  if (s.ayah <= 1) return { ...s };
  return { ...s, ayah: s.ayah - 1, playing: true };
}

export function toggleRepeat(s: PlayerState): PlayerState {
  return { ...s, repeatAyah: !s.repeatAyah };
}

export function tickSleepTimer(
  s: PlayerState,
  elapsedMinutes: number
): PlayerState {
  if (s.sleepTimerMinutes === null) return s;
  const total = s.sleepElapsedMinutes + elapsedMinutes;
  if (total >= s.sleepTimerMinutes) {
    return { ...s, playing: false, sleepTimerMinutes: null, sleepElapsedMinutes: 0 };
  }
  return { ...s, sleepElapsedMinutes: total };
}

export function setSleepTimer(s: PlayerState, minutes: number | null): PlayerState {
  return { ...s, sleepTimerMinutes: minutes, sleepElapsedMinutes: 0 };
}

export function setSpeed(s: PlayerState, speed: number): PlayerState {
  return { ...s, speed };
}

export function setPlaying(s: PlayerState, playing: boolean): PlayerState {
  return { ...s, playing };
}

export function enableStopAtSurahEnd(s: PlayerState): PlayerState {
  return { ...s, sleepStopAtSurahEnd: true };
}
