import type { FavAyah, Settings } from "./storeTypes";

const KEY = "quranifree.v1";

type StoreShape = {
  favorites: FavAyah[];
  lastRead: { surah: number; ayah: number } | null;
  settings: Settings;
};

const DEFAULTS: StoreShape = {
  favorites: [],
  lastRead: null,
  settings: { theme: "dark", reciterId: null, speed: 1 },
};

function hasStorage(): boolean {
  return typeof localStorage !== "undefined";
}

function read(): StoreShape {
  if (!hasStorage()) return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      lastRead: parsed.lastRead ?? null,
      settings: { ...DEFAULTS.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function write(state: StoreShape): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full/unavailable — ignore
  }
}

export function getFavorites(): FavAyah[] {
  return read().favorites;
}

export function toggleFavorite(f: FavAyah): boolean {
  const state = read();
  const idx = state.favorites.findIndex(
    (x) => x.surah === f.surah && x.ayah === f.ayah
  );
  let added: boolean;
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
    added = false;
  } else {
    state.favorites.push(f);
    added = true;
  }
  write(state);
  return added;
}

export function isFavorite(surah: number, ayah: number): boolean {
  return read().favorites.some((x) => x.surah === surah && x.ayah === ayah);
}

export function getLastRead(): { surah: number; ayah: number } | null {
  return read().lastRead;
}

export function setLastRead(surah: number, ayah: number): void {
  const state = read();
  state.lastRead = { surah, ayah };
  write(state);
}

export function getSettings(): Settings {
  return read().settings;
}

export function saveSettings(patch: Partial<Settings>): void {
  const state = read();
  state.settings = { ...state.settings, ...patch };
  write(state);
}
