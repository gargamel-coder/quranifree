import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ayahAudioUrl,
  getSurahList,
  getAyahs,
  getReciters,
  ApiError,
} from "../lib/quranApi";

describe("ayahAudioUrl (pure)", () => {
  it("builds zero-padded everyayah url", () => {
    expect(ayahAudioUrl("Alafasy_128kbps", 1, 5)).toBe(
      "https://everyayah.com/data/Alafasy_128kbps/001005.mp3"
    );
    it;
  });
  it("pads surah and ayah to 3 digits", () => {
    expect(ayahAudioUrl("Abdul_Basit_Murattal_192kbps", 114, 6)).toBe(
      "https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/114006.mp3"
    );
  });
});

describe("getSurahList", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("maps chapters response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          chapters: [
            {
              id: 1,
              name_simple: "Al-Fatihah",
              name_arabic: "الفاتحة",
              verses_count: 7,
              translated_name: { name: "Pembukaan" },
              revelation_place: "makkah",
            },
          ],
        }),
      })
    );
    const list = await getSurahList();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.quran.com/api/v4/chapters?language=id"),
      expect.anything()
    );
    expect(list).toEqual([
      {
        id: 1,
        nameSimple: "Al-Fatihah",
        nameArabic: "الفاتحة",
        translatedName: "Pembukaan",
        ayahCount: 7,
        revelationPlace: "makkah",
      },
    ]);
  });
  it("throws ApiError on non-200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    );
    await expect(getSurahList()).rejects.toBeInstanceOf(ApiError);
  });
});

describe("getAyahs", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("maps verses with uthmani text and indonesian translation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          verses: [
            {
              verse_number: 1,
              text_uthmani: " قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
              translations: [
                { resource_id: 33, text: "Katakanlah, \"Aku berlindung kepada Tuhannya manusia,\"" },
                { resource_id: 131, text: "Say, I seek refuge" },
              ],
            },
          ],
        }),
      })
    );
    const ayahs = await getAyahs(114);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("verses/by_chapter/114"),
      expect.anything()
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("translations=33"),
      expect.anything()
    );
    expect(ayahs).toEqual([
      {
        id: 1,
        textUthmani: " قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
        translation: "Katakanlah, \"Aku berlindung kepada Tuhannya manusia,\"",
      },
    ]);
  });
});

describe("getReciters", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("returns reciters with everyayah folder from map", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          recitations: [
            { id: 7, reciter_name: "Mishari Rashid al-`Afasy", translated_name: { name: "Mishari Rashid al-`Afasy" } },
            { id: 3, reciter_name: "Abdur-Rahman as-Sudais", translated_name: { name: "Abdur-Rahman as-Sudais" } },
          ],
        }),
      })
    );
    const reciters = await getReciters();
    expect(reciters).toEqual([
      expect.objectContaining({ id: 7, name: "Mishari Rashid al-`Afasy", relativePath: "Alafasy_128kbps" }),
      expect.objectContaining({ id: 3, relativePath: "Abdurrahmaan_As-Sudais_192kbps" }),
    ]);
  });
});
