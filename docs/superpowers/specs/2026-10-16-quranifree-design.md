# Quranifree — Design Spec

Date: 2026-10-16
Status: Approved in chat (pending user review of this spec)

## Purpose
A free, installable PWA web app for listening to and reading the Quran —
equivalent in function to Quranify (Quran audio player), but free, no account,
no paywall. Spotify-inspired UI. For personal use by the owner.

Non-goals: user accounts, payments/premium, mobile native apps, copying
Quranify's code/assets/branding.

## Architecture
- **Next.js 14+ (App Router), React, TypeScript.**
- **No backend of our own.** Data sources (public, free):
  - `api.quran.com` (API v4): surah/ayah metadata, Uthmani Arabic text,
    translations (id, en, ...), reciter list.
  - `everyayah.com` CDN: per-ayah audio for many reciters.
- Client state (favorites, last-read, settings) in **localStorage/IndexedDB**.
- **PWA**: web manifest + service worker (next-pwa or hand-rolled Workbox).
- Styling: Tailwind CSS. Fonts: Inter (UI), Amiri Quran (Arabic).

## Pages / Features
| Route | Content |
|---|---|
| `/` (Beranda) | Continue reading (last ayah), quick access: favorites, juz |
| `/surah` | 114 surah list: search, number, Arabic + Latin name, ayah count |
| `/surah/[n]` | Spotify-playlist-style: big header w/ calligraphy cover, green Play button, ayah rows (ayah number in green square), Arabic + translation, per-ayah play, repeat-ayah (hafalan mode) |
| `/reciters` | Artist-page style: reciter list, play all; selection stored globally |
| `/library` (Pustaka) | Favorites (ayah list, offline-persisted) |
| Player bar (sticky, global) | Spotify-style: current ayah (surah + reciter), play/pause, next/prev, per-ayah progress, speed, sleep timer (15/30/60 min or end-of-surah), queue view, moon icon = sleep timer |
| Focus mode | Full-screen "Now Playing": one large ayah, blurred/dimmed background |
| Search | Surah name (Arabic/Latin/translation) — global search tab |

## Offline (light)
- Service worker caches: app shell, last-read surah page (Arabic + translation),
  static assets → readable offline.
- Favorites & progress in local storage.
- Audio streams online (per-ayah chunks from everyayah CDN).
- (Future, out of scope v1) optional per-surah audio download via Cache API.

## Visual design
- Dark theme default: bg #121212, surfaces #1a1a1a/#242424, accent
  olive-green #4caf7d (Spotify-like but distinct), light mode toggle.
- Mobile-first; sidebar on desktop, bottom tab bar on mobile.
- Ayah number rendered in the classic Quranic medallion/square style.

## Error handling
- API failures: cached/stale text when available; friendly retry UI.
- Missing audio file (some ayah/editions missing): skip to next ayah with toast.
- All fetches timeout-bounded; player state machine prevents double-play.

## Testing
- Vitest unit tests: player state machine (play/next/prev/repeat/sleep-timer),
  favorites store, surah search filter.
- Manual: browser walkthrough of all pages, Lighthouse PWA audit, install on
  Android/iOS device.
