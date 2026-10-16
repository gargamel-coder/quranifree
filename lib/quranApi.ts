const API = "https://api.quran.com/api/v4";
const AUDIO_BASE = "https://everyayah.com/data";
const INDONESIAN_TRANSLATION_ID = 33;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message?: string) {
    super(message ?? `API error ${status}`);
    this.status = status;
  }
}

async function apiFetch(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${API}${path}`, { signal: controller.signal });
    if (!res.ok) throw new ApiError(res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export type Surah = {
  id: number;
  nameSimple: string;
  nameArabic: string;
  translatedName: string;
  ayahCount: number;
  revelationPlace: "makkah" | "madinah";
};

export type Ayah = {
  id: number;
  textUthmani: string;
  translation: string;
};

export type Reciter = {
  id: number;
  name: string;
  relativePath: string;
};

// everyayah folder names keyed by api.quran.com recitation id
const RECITER_FOLDERS: Record<number, string> = {
  7: "Alafasy_128kbps",
  2: "Abdul_Basit_Murattal_192kbps",
  1: "Abdul_Basit_Mujawwad_128kbps",
  3: "Abdurrahmaan_As-Sudais_192kbps",
  4: "Abu_Bakr_Ash-Shaatree_128kbps",
  5: "Hani_Rifai_192kbps",
  12: "Husary_128kbps",
  9: "Minshawy_Murattal_128kbps",
  10: "Saood_ash-Shuraym_128kbps",
  11: "Tablawi_26kbps",
};

export function ayahAudioUrl(
  reciterFolder: string,
  surah: number,
  ayah: number
): string {
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return `${AUDIO_BASE}/${reciterFolder}/${s}${a}.mp3`;
}

export async function getSurahList(): Promise<Surah[]> {
  const data = (await apiFetch("/chapters?language=id")) as {
    chapters: Array<{
      id: number;
      name_simple: string;
      name_arabic: string;
      verses_count: number;
      translated_name: { name: string };
      revelation_place: string;
    }>;
  };
  return data.chapters.map((c) => ({
    id: c.id,
    nameSimple: c.name_simple,
    nameArabic: c.name_arabic,
    translatedName: c.translated_name.name,
    ayahCount: c.verses_count,
    revelationPlace: c.revelation_place === "makkah" ? "makkah" : "madinah",
  }));
}

export async function getAyahs(surahId: number): Promise<Ayah[]> {
  const data = (await apiFetch(
    `/verses/by_chapter/${surahId}?fields=text_uthmani&translations=${INDONESIAN_TRANSLATION_ID}&per_page=300`
  )) as {
    verses: Array<{
      verse_number: number;
      text_uthmani: string;
      translations: Array<{ resource_id: number; text: string }>;
    }>;
  };
  return data.verses.map((v) => ({
    id: v.verse_number,
    textUthmani: v.text_uthmani,
    translation:
      v.translations.find((t) => t.resource_id === INDONESIAN_TRANSLATION_ID)
        ?.text ?? "",
  }));
}

export async function getReciters(): Promise<Reciter[]> {
  const data = (await apiFetch("/resources/recitations?language=id")) as {
    recitations: Array<{
      id: number;
      reciter_name: string;
      translated_name: { name: string };
    }>;
  };
  return data.recitations
    .filter((r) => RECITER_FOLDERS[r.id])
    .map((r) => ({
      id: r.id,
      name: r.translated_name.name ?? r.reciter_name,
      relativePath: RECITER_FOLDERS[r.id],
    }));
}
