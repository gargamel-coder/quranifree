export type SurahLite = {
  id: number;
  nameSimple: string;
  nameArabic: string;
  translatedName: string;
  ayahCount: number;
  revelationPlace: "makkah" | "madinah";
};

export function filterSurahs(list: SurahLite[], q: string): SurahLite[] {
  const query = q.trim().toLowerCase();
  if (!query) return list;
  return list.filter(
    (s) =>
      s.nameSimple.toLowerCase().includes(query) ||
      s.translatedName.toLowerCase().includes(query) ||
      s.nameArabic.includes(q.trim()) ||
      String(s.id) === query
  );
}
