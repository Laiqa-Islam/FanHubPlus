/**
 * Fetches the channel art library into `public/content/`.
 *
 *   npx tsx scripts/fetch-art.ts          # only what is missing
 *   npx tsx scripts/fetch-art.ts --force  # re-fetch everything
 *
 * Sources, all free and key-less:
 *
 *   · AniList (graphql.anilist.co) — series posters, banners and character
 *     portraits for the anime, manga, comics, movies, TV and K-Pop channels.
 *     Covers manhwa and idol series too, which is why it carries six of the
 *     eight channels.
 *   · Steam (cdn.cloudflare.steamstatic.com) — game capsule art, by app id.
 *
 * Licensing: this pulls official promotional artwork, which is copyrighted.
 * It is the same trade the project already made for `public/content/` — see
 * the licensing note in README.md. Every file's origin is recorded in
 * `public/content/_sources.json` so provenance is never guesswork.
 *
 * Deliberately NOT here: live-action film and TV posters. TMDB is the right
 * source and needs a free API key; set `TMDB_API_KEY` and this script will
 * pick up the live-action entries below.
 */

import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";

// The art is served by the frontend, so it lands in frontend/public/content.
const OUT_DIR = path.join(process.cwd(), "..", "frontend", "public", "content");
const SOURCES_FILE = path.join(OUT_DIR, "_sources.json");
const FORCE = process.argv.includes("--force");

/**
 * AniList's published limit is 90 requests a minute but the live cap has been
 * degraded to 30 for a long while, so pace for the lower number and still
 * honour Retry-After when it pushes back.
 */
const THROTTLE_MS = 2500;
const MAX_RETRIES = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Series art, grouped by the channel it belongs to. */
const SERIES = {
  anime: [
    {
      slug: "anime-jujutsu-kaisen",
      search: "Jujutsu Kaisen",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "anime-demon-slayer",
      search: "Kimetsu no Yaiba",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "anime-attack-on-titan",
      search: "Shingeki no Kyojin",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "anime-chainsaw-man",
      search: "Chainsaw Man",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "anime-frieren",
      search: "Sousou no Frieren",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "anime-vinland-saga",
      search: "Vinland Saga",
      type: "ANIME",
      format: "TV",
    },
  ],
  manga: [
    { slug: "manga-one-piece", search: "One Piece", type: "MANGA" },
    { slug: "manga-naruto", search: "Naruto", type: "MANGA" },
    { slug: "manga-dragon-ball", search: "Dragon Ball", type: "MANGA" },
    { slug: "manga-tokyo-ghoul", search: "Tokyo Ghoul", type: "MANGA" },
    { slug: "manga-berserk", search: "Berserk", type: "MANGA" },
    { slug: "manga-vagabond", search: "Vagabond", type: "MANGA" },
  ],
  comics: [
    { slug: "comics-solo-leveling", search: "Solo Leveling", type: "MANGA" },
    { slug: "comics-tower-of-god", search: "Tower of God", type: "MANGA" },
    { slug: "comics-the-breaker", search: "The Breaker", type: "MANGA" },
    { slug: "comics-noblesse", search: "Noblesse", type: "MANGA" },
    {
      slug: "comics-omniscient-reader",
      search: "Omniscient Reader",
      type: "MANGA",
    },
  ],
  movies: [
    {
      slug: "movies-your-name",
      search: "Kimi no Na wa",
      type: "ANIME",
      format: "MOVIE",
    },
    {
      slug: "movies-spirited-away",
      search: "Sen to Chihiro",
      type: "ANIME",
      format: "MOVIE",
    },
    {
      slug: "movies-mugen-train",
      search: "Mugen Ressha-hen",
      type: "ANIME",
      format: "MOVIE",
    },
    {
      slug: "movies-suzume",
      search: "Suzume no Tojimari",
      type: "ANIME",
      format: "MOVIE",
    },
    { slug: "movies-akira", search: "Akira", type: "ANIME", format: "MOVIE" },
    {
      slug: "movies-perfect-blue",
      search: "Perfect Blue",
      type: "ANIME",
      format: "MOVIE",
    },
  ],
  "tv-shows": [
    {
      slug: "tv-death-note",
      search: "Death Note",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "tv-classroom-elite",
      search: "Youkoso Jitsuryoku",
      type: "ANIME",
      format: "TV",
    },
    { slug: "tv-kakegurui", search: "Kakegurui", type: "ANIME", format: "TV" },
    {
      slug: "tv-code-geass",
      search: "Code Geass",
      type: "ANIME",
      format: "TV",
    },
    { slug: "tv-monster", search: "Monster", type: "ANIME", format: "TV" },
  ],
  "k-pop": [
    {
      slug: "kpop-oshi-no-ko",
      search: "Oshi no Ko",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "kpop-zombieland-saga",
      search: "Zombieland Saga",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "kpop-carole-tuesday",
      search: "Carole & Tuesday",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "kpop-idoly-pride",
      search: "IDOLY PRIDE",
      type: "ANIME",
      format: "TV",
    },
    {
      slug: "kpop-macross-frontier",
      search: "Macross Frontier",
      type: "ANIME",
      format: "TV",
    },
  ],
  cosplay: [
    // The most-built series; their banners read as costume reference.
    {
      slug: "cosplay-demon-slayer",
      search: "Kimetsu no Yaiba",
      type: "ANIME",
      banner: true,
    },
    {
      slug: "cosplay-jujutsu-kaisen",
      search: "Jujutsu Kaisen",
      type: "ANIME",
      banner: true,
    },
    {
      slug: "cosplay-genshin",
      search: "Genshin Impact",
      type: "ANIME",
      banner: true,
    },
    { slug: "cosplay-re-zero", search: "Re:Zero", type: "ANIME", banner: true },
    {
      slug: "cosplay-fate-stay-night",
      search: "Fate/stay night",
      type: "ANIME",
      banner: true,
    },
  ],
};

/** Steam app ids for the gaming channel — portrait library art. */
const STEAM = [
  { slug: "gaming-elden-ring", appId: 1245620, title: "Elden Ring" },
  { slug: "gaming-cyberpunk-2077", appId: 1091500, title: "Cyberpunk 2077" },
  { slug: "gaming-baldurs-gate-3", appId: 1086940, title: "Baldur's Gate 3" },
  { slug: "gaming-hades", appId: 1145360, title: "Hades" },
  { slug: "gaming-sekiro", appId: 814380, title: "Sekiro" },
  { slug: "gaming-persona-5", appId: 1687950, title: "Persona 5 Royal" },
];

/** Character portraits, for dossiers whose art the local folder never had. */
const CHARACTERS = [
  { slug: "char-luffy", search: "Monkey D. Luffy" },
  { slug: "char-zoro", search: "Roronoa Zoro" },
  { slug: "char-light-yagami", search: "Light Yagami" },
  { slug: "char-l-lawliet", search: "L Lawliet" },
  { slug: "char-ai-hoshino", search: "Ai Hoshino" },
  { slug: "char-kana-arima", search: "Kana Arima" },
  { slug: "char-ruby-hoshino", search: "Ruby Hoshino" },
  { slug: "char-akane-kurokawa", search: "Akane Kurokawa" },
  { slug: "char-shinobu-kocho", search: "Shinobu Kochou" },
  { slug: "char-zenitsu", search: "Zenitsu Agatsuma" },
  { slug: "char-mahito", search: "Mahito" },
  { slug: "char-nanami", search: "Kento Nanami" },
  { slug: "char-yumeko", search: "Yumeko Jabami" },
  { slug: "char-kirari", search: "Kirari Momobami" },
  { slug: "char-mary-saotome", search: "Mary Saotome" },
  { slug: "char-ayanokoji", search: "Kiyotaka Ayanokouji" },
  { slug: "char-horikita", search: "Suzune Horikita" },
  { slug: "char-sakayanagi", search: "Arisu Sakayanagi" },
];

async function anilist(query, variables) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    // 429 carries Retry-After in seconds; respect it rather than guessing,
    // and back off progressively if it keeps refusing.
    if (response.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(response.headers.get("retry-after")) || 0;
      const wait = Math.max(retryAfter * 1000, 5000 * (attempt + 1));
      console.log(`    … rate limited, waiting ${Math.round(wait / 1000)}s`);
      await sleep(wait);
      continue;
    }

    if (!response.ok) throw new Error(`AniList HTTP ${response.status}`);
    const body = await response.json();

    if (body.errors?.length) {
      const message = body.errors.map((e) => e.message).join("; ");
      if (/too many requests/i.test(message) && attempt < MAX_RETRIES) {
        const wait = 5000 * (attempt + 1);
        console.log(`    … rate limited, waiting ${Math.round(wait / 1000)}s`);
        await sleep(wait);
        continue;
      }
      throw new Error(message);
    }

    if (!body.data) throw new Error("AniList returned no data");
    return body.data;
  }
}

/**
 * Built per call rather than as one constant: sending `format: null` makes
 * AniList return 404 instead of ignoring the filter, so an unnarrowed search
 * has to leave the argument out of the document altogether.
 */
function mediaQuery(withFormat) {
  return `
  query ($search: String, $type: MediaType${withFormat ? ", $format: MediaFormat" : ""}) {
    Media(search: $search, type: $type${withFormat ? ", format: $format" : ""}, sort: SEARCH_MATCH) {
      title { romaji english }
      coverImage { extraLarge large }
      bannerImage
      siteUrl
    }
  }`;
}

const CHARACTER_QUERY = `
  query ($search: String) {
    Character(search: $search) {
      name { full }
      image { large }
      siteUrl
    }
  }`;

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function download(url, slug) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`download HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  // Keep the real extension: AniList serves png for some character art.
  const ext = new URL(url).pathname.endsWith(".png") ? "png" : "jpg";
  const file = path.join(OUT_DIR, `${slug}.${ext}`);
  await writeFile(file, buffer);
  return `${slug}.${ext}`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let provenance = {};
  try {
    provenance = JSON.parse(await readFile(SOURCES_FILE, "utf8"));
  } catch {
    // First run.
  }
  let fetched = 0;
  let skipped = 0;
  const failures = [];

  // ── Series art ────────────────────────────────────────────────────────
  for (const [channel, wants] of Object.entries(SERIES)) {
    console.log(`\n→ ${channel}`);
    for (const want of wants) {
      if (!FORCE && (await exists(path.join(OUT_DIR, `${want.slug}.jpg`)))) {
        skipped++;
        console.log(`  · ${want.slug} (have it)`);
        continue;
      }
      try {
        await sleep(THROTTLE_MS);
        const data = await anilist(
          mediaQuery(Boolean(want.format)),
          want.format
            ? { search: want.search, type: want.type, format: want.format }
            : { search: want.search, type: want.type },
        );

        const media = data.Media;
        const url = want.banner
          ? (media.bannerImage ?? media.coverImage.extraLarge)
          : (media.coverImage.extraLarge ?? media.coverImage.large);

        const written = await download(url, want.slug);
        provenance[written] = {
          source: "AniList",
          url: media.siteUrl,
          title: media.title.english ?? media.title.romaji,
        };
        fetched++;
        console.log(
          `  ✓ ${written}  ${media.title.english ?? media.title.romaji}`,
        );
      } catch (error) {
        failures.push(`${want.slug}: ${error.message}`);
        console.log(`  ✗ ${want.slug} — ${error.message}`);
      }
    }
  }

  // ── Character portraits ───────────────────────────────────────────────
  console.log(`\n→ character portraits`);
  for (const want of CHARACTERS) {
    const already =
      (await exists(path.join(OUT_DIR, `${want.slug}.jpg`))) ||
      (await exists(path.join(OUT_DIR, `${want.slug}.png`)));
    if (!FORCE && already) {
      skipped++;
      console.log(`  · ${want.slug} (have it)`);
      continue;
    }
    try {
      await sleep(THROTTLE_MS);
      const data = await anilist(CHARACTER_QUERY, { search: want.search });

      const written = await download(data.Character.image.large, want.slug);
      provenance[written] = {
        source: "AniList",
        url: data.Character.siteUrl,
        title: data.Character.name.full,
      };
      fetched++;
      console.log(`  ✓ ${written}  ${data.Character.name.full}`);
    } catch (error) {
      failures.push(`${want.slug}: ${error.message}`);
      console.log(`  ✗ ${want.slug} — ${error.message}`);
    }
  }

  // ── Steam capsules ────────────────────────────────────────────────────
  console.log(`\n→ gaming`);
  for (const game of STEAM) {
    if (!FORCE && (await exists(path.join(OUT_DIR, `${game.slug}.jpg`)))) {
      skipped++;
      console.log(`  · ${game.slug} (have it)`);
      continue;
    }
    // Portrait library art first; the landscape header is the fallback for
    // older apps that never got one.
    const candidates = [
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/library_600x900_2x.jpg`,
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/library_600x900.jpg`,
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/header.jpg`,
    ];
    let done = false;
    for (const url of candidates) {
      try {
        const written = await download(url, game.slug);
        provenance[written] = {
          source: "Steam",
          url: `https://store.steampowered.com/app/${game.appId}/`,
          title: game.title,
        };
        fetched++;
        done = true;
        console.log(`  ✓ ${written}  ${game.title}`);
        break;
      } catch {
        // Try the next shape.
      }
    }
    if (!done) {
      failures.push(`${game.slug}: no Steam art found`);
      console.log(`  ✗ ${game.slug} — no Steam art found`);
    }
  }

  await writeFile(
    SOURCES_FILE,
    `${JSON.stringify(provenance, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `\n✓ ${fetched} fetched, ${skipped} already present, ${failures.length} failed.`,
  );
  if (failures.length) {
    console.log("\nFailures:");
    for (const failure of failures) console.log(`  · ${failure}`);
  }
  console.log(`\nProvenance written to frontend/public/content/_sources.json`);
}

main().catch((error) => {
  console.error("\n✗ fetch-art failed:", error);
  process.exit(1);
});
