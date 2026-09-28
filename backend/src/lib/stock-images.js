/**
 * The art library.
 *
 * Every file here is served from `public/content/` rather than hot-linked, so
 * the site's imagery loads with the page and survives an offline demo.
 *
 * Two kinds of file live there:
 *
 *   · Channel art fetched by `scripts/fetch-art.ts` — official series covers,
 *     film posters, game capsules and character portraits, named
 *     `<channel>-<title>` and `char-<name>`. Provenance for each one is
 *     recorded in `public/content/_sources.json`.
 *   · Fan art supplied with the Neon Oni build, named by subject.
 *
 * ── Licensing note ──────────────────────────────────────────────────────
 * Both kinds are copyrighted. This pool replaced a curated Unsplash set that
 * existed specifically to honour SRS §1.5, which asks the project not to host
 * copyrighted franchise art. That constraint no longer holds for this build —
 * the decision was deliberate, and this comment exists so nobody later reads
 * §1.5 and assumes the code still follows it. If the project is ever taken
 * past coursework, `public/content/` is the first thing to clear.
 *
 * Ids carry their own extension because the sources mix JPEG and PNG, and
 * guessing wrong is a broken image rather than a caught error.
 */

const BASE = "/content/";

/** Resolves a library id (including its extension) to its served path. */
export function stock(id) {
  return `${BASE}${id}`;
}

/**
 * Art grouped by the channel it belongs to, leading with the official cover
 * or poster for that medium: series art for anime and TV, film posters for
 * movies, capsule art for games, volume covers for manga and comics.
 */
export const STOCK = {
  anime: [
    "anime-jujutsu-kaisen.jpg",
    "anime-demon-slayer.jpg",
    "anime-attack-on-titan.jpg",
    "anime-chainsaw-man.png",
    "anime-frieren.jpg",
    "anime-vinland-saga.jpg",
  ],
  manga: [
    "manga-one-piece.jpg",
    "manga-naruto.jpg",
    "manga-dragon-ball.jpg",
    "manga-tokyo-ghoul.png",
    "manga-berserk.jpg",
    "manga-vagabond.png",
  ],
  comics: [
    "comics-solo-leveling.jpg",
    "comics-tower-of-god.jpg",
    "comics-omniscient-reader.jpg",
    "comics-noblesse.png",
    "comics-the-breaker.jpg",
  ],
  // Live-action one-sheets. The anime films fetched from AniList are still
  // in the folder and still good art, but a "Movies" channel that opens on
  // theatrical posters reads as a film section rather than a second anime one.
  movies: [
    "movies-deadpool-wolverine.jpg",
    "movies-interstellar.jpg",
    "movies-john-wick.jpg",
    "movies-avengers.jpg",
    "movies-lotr-fellowship.jpg",
    "movies-the-prestige.jpg",
    "movies-avatar-fire-and-ash.jpg",
    "movies-titanic.jpg",
    "movies-oblivion.jpg",
    "movies-glass.jpg",
    "movies-doctor-strange.jpg",
    "movies-world-war-z.jpg",
  ],
  "tv-shows": [
    "tv-peaky-blinders.jpg",
    "tv-game-of-thrones.jpg",
    "tv-wednesday.jpg",
    "tv-house-of-the-dragon.jpg",
    "tv-vampire-diaries.jpg",
    "tv-lucifer.jpg",
    "tv-the-manipulated.jpg",
  ],
  gaming: [
    "gaming-elden-ring.jpg",
    "gaming-cyberpunk-2077.jpg",
    "gaming-baldurs-gate-3.jpg",
    "gaming-hades.jpg",
    "gaming-sekiro.jpg",
    "gaming-persona-5.jpg",
  ],
  // Real groups and artists. The idol-anime covers fetched earlier are still
  // on disk, but a K-Pop channel should open on K-Pop.
  "k-pop": [
    "kpop-blackpink-roses.jpg",
    "kpop-bts-black-swan.jpg",
    "kpop-stray-kids-group.jpg",
    "kpop-gidle.jpg",
    "kpop-blackpink-the-album.jpg",
    "kpop-bts-map-of-the-soul.jpg",
    "kpop-skz-ot8.jpg",
    "kpop-rose.jpg",
    "kpop-aespa-drama.jpg",
    "kpop-bts-butter.jpg",
    "kpop-blackpink-members.jpg",
    "kpop-gidle-tomboy.jpg",
  ],
  // The cosplay pool is banner art rather than covers: a wide production
  // still reads as costume reference, where a portrait cover does not.
  cosplay: [
    "cosplay-demon-slayer.jpg",
    "cosplay-jujutsu-kaisen.jpg",
    "cosplay-genshin.jpg",
    "cosplay-re-zero.jpg",
    "cosplay-fate-stay-night.jpg",
  ],
};

/** Wide, atmospheric art used behind event listings. */
export const EVENT_IMAGES = [
  "cosplay-jujutsu-kaisen.jpg",
  "kpop-stray-kids-group.jpg",
  "cosplay-demon-slayer.jpg",
  "kpop-blackpink-roses.jpg",
  "cosplay-genshin.jpg",
  "kpop-bts-ot7.jpg",
];

/** The hero plate — dark ground, cyan key light, reads at any crop. */
export const HERO_IMAGE = "gojo-void.jpg";

/**
 * Picks by position within the channel's pool rather than by hashing the
 * slug.
 *
 * Hashing looked tidier but collided often enough that the same picture
 * appeared two or three times in a single channel listing. Cycling by index
 * guarantees the pool is exhausted before anything repeats, and it stays
 * deterministic — the same record always resolves to the same art across
 * reseeds.
 */
export function pickStock(category, index, offset = 0) {
  const pool = STOCK[category] ?? STOCK.anime;
  return stock(pool[(index + offset) % pool.length]);
}
