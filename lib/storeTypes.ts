export type FavAyah = {
  surah: number;
  ayah: number;
  text: string;
};

export type Settings = {
  theme: "dark" | "light";
  reciterId: number | null;
  speed: number;
};
