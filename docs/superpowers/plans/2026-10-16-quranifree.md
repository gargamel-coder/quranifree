# Quranifree Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Quranifree — a free, installable Next.js PWA for reading and listening to the Quran with a Spotify-inspired UI (dark #121212, olive-green #4caf7d accent).

**Architecture:** Next.js App Router + TypeScript, no backend — fetch from api.quran.com v4 and everyayah.com CDN client-side; favorites/progress/settings in localStorage via a small typed store module; global player state via React context + a pure state-machine module (unit-testable); PWA via hand-rolled service worker + manifest.

**Tech Stack:** Next.js 14+, React, TypeScript, Tailwind CSS, Vitest, Service Worker API.

**Spec:** `docs/superpowers/specs/2026-10-16-quranifree-design.md`

## Global Constraints

- App name: **Quranifree**; tagline: *"Al-Qur'an murottal. Gratis, tanpa akun."*
- Dark theme default: bg `#121212`, surfaces `#1a1a1a`/`#242424`, accent `#4caf7d`; light mode toggle.
- Fonts: Inter (UI), Amiri Quran (Arabic).
- No accounts, no payments, no copied Quranify assets/code.
- Text API: `https://api.quran.com/api/v4/...`; audio: `https://everyayah.com/data/{reciter}/{surah3pad}{ayah3pad}.mp3`.
- Player, favorites, search logic must be pure modules importable by Vitest (no DOM/window at module top level).

## Review Focus

- Missing audio file for an ayah (some reciter/ayah combos 404 on everyayah) → skip to next ayah + toast, never stall the player. (Task 4 test)
- Timer fires at end-of-surah boundary → stop playback, don't autoplay next surah. (Task 4 test)
- Search with Arabic input vs Latin vs translation text → all three match. (Task 5 test)
- Offline first load of a previously-read surah → SW serves cached page; favorites persist. (Task 7 manual)
- Repeat-ayah off-by-one at surah end → repeats last ayah, does not advance. (Task 4 test)

---

### Task 1: Scaffold Next.js app + Tailwind + fonts + theme

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `.gitignore`

**Interfaces:**
- Produces: runnable Next.js app at localhost:3000; Tailwind tokens `bg-base #121212`, `surface #1a1a1a`, `surface2 #242424`, `accent #4caf7d`; `<html lang="id" class="dark">` default.

- [ ] **Step 1: Scaffold** — `npx create-next-app@latest . --ts --tailwind --app --no-src-dir --import-alias "@/*"` inside `/opt/data/quranifree` (merge with existing docs dir; commit only generated files).
- [ ] **Step 2: Theme tokens** — in `tailwind.config.ts` set `colors: { base:'#121212', surface:'#1a1a1a', surface2:'#242424', accent:'#4caf7d' }`; in `app/globals.css` import Google font Amiri Quran via `@import url(...)` and set body bg `bg-base text-white`.
- [ ] **Step 3: Manifest** — `public/manifest.webmanifest` with `name: "Quranifree"`, `short_name: "Quranifree"`, `start_url: "/"`, `display: standalone`, `background_color: "#121212"`, `theme_color: "#121212"`; generate simple green icon PNGs (Any solid-color placeholder acceptable).
- [ ] **Step 4: Verify** — `npm run dev` → homepage renders with dark bg; commit `feat: scaffold Next.js app with theme and manifest`.

### Task 2: Quran API client (pure module)

**Files:**
- Create: `lib/quranApi.ts`
- Test: `tests/quranApi.test.ts`

**Interfaces:**
- Produces:
  - `type Surah = { id:number; nameSimple:string; nameArabic:string; translatedName:string; ayahCount:number }`
  - `type Ayah = { id:number; textUthmani:string; translation:string }`
  - `type Reciter = { id:number; name:string; relativePath:string }` (relativePath = everyayah folder name, e.g. `Alafasy_128kbps`)
  - `getSurahList(): Promise<Surah[]>` — GET `/chapters?language=id`
  - `getAyahs(surahId:number): Promise<Ayah[]>` — GET `/verses/by_chapter/{id}?fields=text_uthmani&translations=33&per_page=300` (translation id 33 = Indonesian)
  - `getReciters(): Promise<Reciter[]>` — GET `/recitations?language=id` (map `relative_path` → everyayah folder)
  - `ayahAudioUrl(reciterFolder:string, surah:number, ayah:number): string` — pure, no fetch: `https://everyayah.com/data/${folder}/${String(surah).padStart(3,'0')}${String(ayah).padStart(3,'0')}.mp3`

- [ ] **Step 1: Write failing test** for `ayahAudioUrl` (`ayahAudioUrl('Alafasy_128kbps', 1, 5)` === `'https://everyayah.com/data/Alafasy_128kbps/001005.mp3'`) and for `getSurahList`/`getAyahs` with a mocked `fetch` returning fixture JSON shaped like api.quran.com responses; assert mapping of fields and `ayahCount` from `number_of_ayahs`.
- [ ] **Step 2: Run test** `npx vitest run` — expected FAIL (module missing).
- [ ] **Step 3: Implement** `lib/quranApi.ts` per signatures above; base URL constant `const API='https://api.quran.com/api/v4'`; 10s fetch timeout via AbortController; throw typed `ApiError` on non-200.
- [ ] **Step 4: Run test** — expected PASS.
- [ ] **Step 5: Commit** `feat: quran api client`.

### Task 3: Local store (favorites, last-read, settings)

**Files:**
- Create: `lib/store.ts`
- Test: `tests/store.test.ts`

**Interfaces:**
- Produces:
  - `type FavAyah = { surah:number; ayah:number; text:string }`
  - `getFavorites(): FavAyah[]`, `toggleFavorite(f:FavAyah): boolean` (returns true if now favorite), `isFavorite(surah:number,ayah:number): boolean`
  - `getLastRead(): { surah:number; ayah:number } | null`, `setLastRead(surah:number, ayah:number): void`
  - `getSettings(): { theme:'dark'|'light'; reciterId:number|null; speed:number }`, `saveSettings(patch:Partial<Settings>): void`
  - All storage under one key `quranifree.v1`; SSR-safe: functions no-op (or return defaults) when `typeof localStorage === 'undefined'`.

- [ ] **Step 1: Write failing test** — mock `localStorage` (simple object with getItem/setItem); assert toggle adds then removes, last-read persists, unknown keys return defaults.
- [ ] **Step 2: Run test** — FAIL.
- [ ] **Step 3: Implement** `lib/store.ts` with read/write JSON helpers + guards.
- [ ] **Step 4: Run test** — PASS.
- [ ] **Step 5: Commit** `feat: local store`.

### Task 4: Player state machine (pure) + audio wiring + sleep timer

**Files:**
- Create: `lib/playerMachine.ts`, `components/PlayerProvider.tsx`, `components/PlayerBar.tsx`
- Test: `tests/playerMachine.test.ts`

**Interfaces:**
- Produces (pure machine, `lib/playerMachine.ts`):
  - `type PlayerState = { surah:number; ayah:number; playing:boolean; repeatAyah:boolean; speed:number; sleepTimerMinutes:number|null; sleepStopAtSurahEnd:boolean }`
  - `initialState(surah:number, ayah:number): PlayerState`
  - `next(s:PlayerState, ayahCount:number): PlayerState` — advance ayah; at last ayah → stop (does NOT auto-advance surah)
  - `prev(s:PlayerState): PlayerState` — to ayah-1; at ayah 1 stays
  - `toggleRepeat(s:PlayerState): PlayerState`
  - `tickSleepTimer(s:PlayerState, elapsedMinutes:number): PlayerState` — when `sleepTimerMinutes` reached → `playing:false`, clear timer
- PlayerProvider: React context holding an `<audio>` element (created in client effect), exposes `{state, play(surah,ayah), pause(), resume(), setSpeed(x), setSleepTimer(min|null), enableStopAtSurahEnd()}`; on audio `ended`: if repeatAyah → replay same ayah, else if sleepStopAtSurahEnd → stop, else `next` + load new audio URL (using Task 2 `ayahAudioUrl`) + play; on 404/error event → toast (simple `window.alert`-free inline toast component) and skip to next ayah. Persists last-read via Task 3 `setLastRead` on ayah change.
- PlayerBar: sticky bottom bar, `bg-surface`: left = Surah name + reciter + ayah number; center = play/pause, prev/next, per-ayah progress bar (audio timeupdate); right = speed cycle (1x/1.25x/1.5x/2x), moon icon → sleep timer popover (15/30/60/End of surah), queue button → simple popover listing remaining ayahs of current surah.

- [ ] **Step 1: Write failing tests** for machine: `next` at last ayah returns `playing:false` same ayah; `next` mid-surah advances; `prev` at ayah 1 stays; `tickSleepTimer` with elapsed ≥ timer sets `playing:false`; repeat flag toggles. Include the Review Focus cases (end-of-surah sleep boundary; repeat at last ayah doesn't advance).
- [ ] **Step 2: Run test** — FAIL.
- [ ] **Step 3: Implement** machine pure functions.
- [ ] **Step 4: Run test** — PASS.
- [ ] **Step 5: Implement** PlayerProvider + PlayerBar (no unit test; manual verify).
- [ ] **Step 6: Manual verify** — run dev, play surah 1 ayah 1 (Alafasy), confirm audio plays, next advances, bar renders.
- [ ] **Step 7: Commit** `feat: player machine, provider, player bar`.

### Task 5: Surah list + search, Beranda (continue reading), Pustaka (favorites)

**Files:**
- Create: `app/page.tsx` (Beranda), `app/surah/page.tsx`, `components/SurahList.tsx`, `lib/search.ts`, `app/library/page.tsx`, `components/FavList.tsx`
- Test: `tests/search.test.ts`

**Interfaces:**
- Consumes: Task 2 `getSurahList`, Task 3 store, Task 4 PlayerProvider `play()`.
- Produces: `filterSurahs(list:Surah[], q:string): Surah[]` — case-insensitive match on `nameSimple`, `nameArabic`, `translatedName`.
- Beranda: if `getLastRead()` non-null → card "Lanjutkan: {surah name} ayat {n}" linking to `/surah/{id}`; favorites quick list (top 5); grid of 30 juz links (each links to `/surah` filtered by juz — simple: link to `/surah?juz=n`, juz→surah mapping from `getSurahList` chapters' `juz` not available → instead show 30 juz as links to surah 1..114 filtered client-side using a static juz-start map constant in `lib/juzStarts.ts`).
- Surah list: rows with number-in-green-square, Arabic name right, Latin name + "Makkiyah/Madaniyah · {ayahCount} ayat"; search input filters via `filterSurahs` client-side (fetch list once, cache in module var).

- [ ] **Step 1: Write failing test** for `filterSurahs`: matches Arabic string, Latin lowercase, translation substring, returns [] for no match.
- [ ] **Step 2: Run** — FAIL. **Step 3: Implement** `lib/search.ts` + `lib/juzStarts.ts` (hardcode 30 surah-start indices for juz). **Step 4: Run** — PASS.
- [ ] **Step 5: Implement** pages/components; wire Beranda "Lanjutkan" to store, library page lists `getFavorites()` with remove buttons and per-ayah play via PlayerProvider.
- [ ] **Step 6: Manual verify** — search "Yasin" and "يس"; continue-reading card appears after Task 6 usage; commit `feat: home, surah list, search, library`.

### Task 6: Surah read page (playlist UI) + reciters page

**Files:**
- Create: `app/surah/[id]/page.tsx`, `components/AyahList.tsx`, `components/SurahHeader.tsx`, `app/reciters/page.tsx`
- Modify: `app/layout.tsx` (add nav: sidebar desktop / bottom tab bar mobile: Beranda, Cari→/surah, Pustaka, Qari)

**Interfaces:**
- Consumes: Task 2 `getAyahs`, `getReciters`, `ayahAudioUrl`; Task 3 `isFavorite`/`toggleFavorite`; Task 4 `play()`.
- Produces: AyahList row = green square ayah number, Uthmani text (dir=rtl, font-amiri, text-2xl, leading-loose), translation below, row actions: play (calls `play(surah, ayah)`), repeat-ayah toggle, heart (favorite).
- SurahHeader: green gradient hero, big calligraphy `nameArabic`, "Play" pill button (plays ayah 1), "{ayahCount} ayat · {translatedName}".
- Reciters page: grid cards of reciters; clicking sets `saveSettings({reciterId})` and highlights active; PlayerProvider reads `reciterId` → resolves folder via Task 2 `getReciters()` cached in module.

- [ ] **Step 1: Implement** components/pages per signatures above.
- [ ] **Step 2: Manual verify** — open `/surah/36` (Yasin), Play button plays ayah 1 with chosen reciter; favorite a few ayahs → appear in /library; reciter switch changes audio folder (verify in network tab).
- [ ] **Step 3: Commit** `feat: surah read page, reciters, nav`.

### Task 7: Focus mode + PWA service worker (offline shell + last surah)

**Files:**
- Create: `components/FocusMode.tsx`, `public/sw.js`, `public/register-sw.js` (or inline register in layout)
- Modify: `app/layout.tsx` (register SW), `components/PlayerBar.tsx` (focus-mode button)

**Interfaces:**
- Consumes: Task 4 PlayerProvider state.
- FocusMode: full-screen overlay (`fixed inset-0 bg-base/95 backdrop-blur`), current ayah large centered (font-amiri text-4xl rtl + translation), tap anywhere dismisses, prev/next controls bottom.
- `sw.js`: install → precache `/`, `/surah`, `/library`, manifest, icons; fetch handler: for navigations, network-first with cache fallback; cache successful GET navigations into runtime cache (so last-read surah page works offline); static assets cache-first.

- [ ] **Step 1: Implement** FocusMode + wire button in PlayerBar.
- [ ] **Step 2: Implement** `sw.js` per strategy above; register in layout client component.
- [ ] **Step 3: Manual verify** — load `/surah/36`, go offline (devtools), reload → page renders from cache; focus mode shows current ayah; run `npx lighthouse --preset=desktop` → PWA installable check passes.
- [ ] **Step 4: Commit** `feat: focus mode, PWA offline shell`.

### Task 8: Full-suite test run + polish pass

**Files:**
- Modify: as needed from failures.

- [ ] **Step 1:** `npx vitest run` — all tests PASS.
- [ ] **Step 2:** `npm run build` — production build succeeds (catches SSR issues in store/provider — must be 'use client' guarded).
- [ ] **Step 3:** Manual walkthrough: Beranda → Surah → play → next surah end behavior → favorite → library → reciter change → focus mode → offline reload. Fix any breakage found, re-run tests.
- [ ] **Step 4:** Commit `chore: polish pass and build fixes`.
