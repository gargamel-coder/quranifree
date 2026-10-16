import { describe, it, expect } from "vitest";
import {
  initialState,
  next,
  prev,
  toggleRepeat,
  tickSleepTimer,
} from "../lib/playerMachine";

describe("playerMachine", () => {
  it("initialState sets playing and defaults", () => {
    const s = initialState(36, 1);
    expect(s).toMatchObject({
      surah: 36,
      ayah: 1,
      playing: true,
      repeatAyah: false,
      sleepTimerMinutes: null,
      sleepStopAtSurahEnd: false,
    });
  });

  it("next advances mid-surah", () => {
    const s = next({ ...initialState(36, 1) }, 83);
    expect(s.ayah).toBe(2);
    expect(s.playing).toBe(true);
  });

  it("next at last ayah stops, does not advance", () => {
    const s = next({ ...initialState(114, 6) }, 6);
    expect(s.ayah).toBe(6);
    expect(s.playing).toBe(false);
  });

  it("prev goes back; at ayah 1 stays", () => {
    expect(prev({ ...initialState(36, 5) }).ayah).toBe(4);
    const s = prev({ ...initialState(36, 1) });
    expect(s.ayah).toBe(1);
  });

  it("toggleRepeat flips flag", () => {
    const s = toggleRepeat({ ...initialState(36, 1) });
    expect(s.repeatAyah).toBe(true);
    expect(toggleRepeat(s).repeatAyah).toBe(false);
  });

  it("tickSleepTimer stops when elapsed reaches timer", () => {
    let s: import("../lib/playerMachine").PlayerState = {
      ...initialState(36, 1),
      sleepTimerMinutes: 30,
    };
    s = tickSleepTimer(s, 29);
    expect(s.playing).toBe(true);
    s = tickSleepTimer(s, 1); // cumulative 30
    expect(s.playing).toBe(false);
    expect(s.sleepTimerMinutes).toBeNull();
  });

  it("sleep timer at end-of-surah boundary stops instead of advancing", () => {
    let s = { ...initialState(114, 5), sleepStopAtSurahEnd: true };
    s = next(s, 6); // reaches last ayah, still playing
    expect(s.playing).toBe(true);
    expect(s.ayah).toBe(6);
    s = next(s, 6); // at last ayah with stop-at-end → stop, no advance
    expect(s.playing).toBe(false);
    expect(s.ayah).toBe(6);
  });

  it("repeat at last ayah does not advance", () => {
    const s = toggleRepeat({ ...initialState(114, 6) });
    const n = next(s, 6);
    expect(n.ayah).toBe(6);
    expect(n.playing).toBe(true);
  });
});
