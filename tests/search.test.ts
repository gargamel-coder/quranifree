import { describe, it, expect } from "vitest";
import { filterSurahs, type SurahLite } from "../lib/search";

const list: SurahLite[] = [
  { id: 1, nameSimple: "Al-Fatihah", nameArabic: "الفاتحة", translatedName: "Pembukaan", ayahCount: 7, revelationPlace: "makkah" as const },
  { id: 36, nameSimple: "Ya-Sin", nameArabic: "يس", translatedName: "Yasin", ayahCount: 83, revelationPlace: "makkah" as const },
  { id: 114, nameSimple: "An-Nas", nameArabic: "الناس", translatedName: "Manusia", ayahCount: 6, revelationPlace: "makkah" as const },
];

describe("filterSurahs", () => {
  it("matches Latin name case-insensitively", () => {
    expect(filterSurahs(list, "ya-sin").map((s) => s.id)).toEqual([36]);
  });
  it("matches translated name substring", () => {
    expect(filterSurahs(list, "manusia").map((s) => s.id)).toEqual([114]);
  });
  it("matches Arabic input", () => {
    expect(filterSurahs(list, "يس").map((s) => s.id)).toEqual([36]);
  });
  it("matches surah number", () => {
    expect(filterSurahs(list, "36").map((s) => s.id)).toEqual([36]);
  });
  it("returns [] on no match", () => {
    expect(filterSurahs(list, "xyz")).toEqual([]);
  });
  it("empty query returns full list", () => {
    expect(filterSurahs(list, "")).toHaveLength(3);
  });
});
