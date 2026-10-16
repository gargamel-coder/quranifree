// First surah of each juz (1-30), standard Quran juz boundaries.
// Value = surah number where that juz begins; ayah start is always 1 for
// these surahs except juz that begin mid-surah (handled approximately for v1).
export const JUZ_STARTS: number[] = [
  1, // juz 1
  2, // juz 2 (starts at Al-Baqarah 142, approximated to surah start)
  2, // juz 3
  3, // juz 4
  4, // juz 5
  4, // juz 6
  5, // juz 7
  6, // juz 8
  7, // juz 9
  8, // juz 10
  9, // juz 11
  11, // juz 12
  12, // juz 13
  15, // juz 14
  17, // juz 15
  18, // juz 16
  21, // juz 17
  23, // juz 18
  25, // juz 19
  27, // juz 20
  29, // juz 21
  33, // juz 22
  36, // juz 23
  39, // juz 24
  41, // juz 25
  46, // juz 26
  51, // juz 27
  58, // juz 28
  67, // juz 29
  78, // juz 30
];
