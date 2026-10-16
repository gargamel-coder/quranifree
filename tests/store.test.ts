import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getFavorites,
  toggleFavorite,
  isFavorite,
  getLastRead,
  setLastRead,
  getSettings,
  saveSettings,
} from "../lib/store";

// minimal localStorage mock
const backing = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => backing.get(k) ?? null,
  setItem: (k: string, v: string) => void backing.set(k, v),
  removeItem: (k: string) => void backing.delete(k),
  clear: () => backing.clear(),
};

beforeEach(() => {
  backing.clear();
  vi.stubGlobal("localStorage", localStorageMock);
});

describe("favorites", () => {
  it("starts empty", () => {
    expect(getFavorites()).toEqual([]);
  });
  it("toggle adds then removes, returns state", () => {
    const f = { surah: 36, ayah: 1, text: "يس" };
    expect(toggleFavorite(f)).toBe(true);
    expect(getFavorites()).toEqual([f]);
    expect(toggleFavorite(f)).toBe(false);
    expect(getFavorites()).toEqual([]);
  });
  it("isFavorite reflects state", () => {
    toggleFavorite({ surah: 1, ayah: 2, text: "x" });
    expect(isFavorite(1, 2)).toBe(true);
    expect(isFavorite(1, 3)).toBe(false);
  });
});

describe("last read", () => {
  it("defaults to null and persists", () => {
    expect(getLastRead()).toBeNull();
    setLastRead(36, 5);
    expect(getLastRead()).toEqual({ surah: 36, ayah: 5 });
  });
});

describe("settings", () => {
  it("defaults and merges patches", () => {
    expect(getSettings()).toEqual({ theme: "dark", reciterId: null, speed: 1 });
    saveSettings({ reciterId: 7 });
    expect(getSettings()).toEqual({ theme: "dark", reciterId: 7, speed: 1 });
    saveSettings({ speed: 1.5 });
    expect(getSettings().speed).toBe(1.5);
    expect(getSettings().reciterId).toBe(7);
  });
});
