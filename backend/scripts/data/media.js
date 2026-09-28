/**
 * Media for the Multimedia Center (SRS FR-5).
 *
 * Video is served from `public/media/`. Every file was opened and watched
 * before being described here, so the runtime, the credit and the piece
 * written about it match what is actually on screen; runtimes came from
 * `HTMLMediaElement.duration` rather than being estimated. The poster for
 * each one is a real frame lifted from that file, stored beside the rest of
 * the art library as `public/content/video-*.jpg`.
 *
 * ── Licensing note ──────────────────────────────────────────────────────
 * This replaced a set of Blender open-movie and CC0 clips that existed
 * specifically to honour SRS §1.5. The clips here are copyrighted franchise
 * media and fan works built on it, so that constraint no longer holds — the
 * same deliberate override already documented in `lib/stock-images.ts`. If
 * the project is ever taken past coursework, `public/media/` clears out
 * alongside `public/content/`.
 *
 * Audio is still freely licensed instrumental music, because no audio was
 * supplied; those five entries are the only placeholders left in here.
 */

/**
 * Admin-controlled media tags (SRS FR-5), split by format so a video never
 * gets labelled "Podcast" and a track never gets labelled "Timelapse".
 */
export const VIDEO_TAGS = [
  "Trailer",
  "Music Video",
  "Lyric Video",
  "Title Sequence",
  "Fan Edit",
  "Fan Animation",
  "Breakdown",
  "Explainer",
  "Interview",
];

export const AUDIO_TAGS = ["Podcast", "Soundtrack", "Interview", "Session"];

export const MEDIA_TAGS = [...VIDEO_TAGS, ...AUDIO_TAGS, "Gallery"];

/**
 * Keyed rather than positional so a content piece can name the clip it is
 * about. The old array was cycled by index, which is how a piece on action
 * choreography ended up introducing a rabbit.
 */
export const VIDEO_LIBRARY = {
  "demon-slayer-fight-edit": {
    url: "/media/demon-slayer-fight-edit.mp4",
    poster: "/content/video-demon-slayer-fights.jpg",
    credit: "Demon Slayer: Kimetsu no Yaiba — ufotable / Aniplex. Fan edit.",
    runtime: "1:44",
    tag: "Fan Edit",
  },
  "jujutsu-kaisen-big-dawgs": {
    url: "/media/jujutsu-kaisen-big-dawgs.mp4",
    poster: "/content/video-jujutsu-kaisen-amv.jpg",
    credit:
      "Jujutsu Kaisen — MAPPA / Shueisha, cut to Hanumankind's \u201cBig Dawgs\u201d. Fan edit, credited on screen to Babyartmusicpickle.",
    runtime: "1:45",
    tag: "Fan Edit",
  },
  "blackpink-lovesick-girls": {
    url: "/media/blackpink-lovesick-girls.mp4",
    poster: "/content/video-blackpink-lovesick-girls.jpg",
    credit:
      "BLACKPINK \u2014 \u201cLovesick Girls\u201d (2020.10.02), YG Entertainment.",
    runtime: "3:06",
    tag: "Music Video",
  },
  "exo-love-shot-lyrics": {
    url: "/media/exo-love-shot-lyrics.mp4",
    poster: "/content/video-exo-love-shot.jpg",
    credit:
      "EXO \u2014 \u201cLove Shot\u201d (2018), SM Entertainment. Fan-made colour-coded lyric video, Han/Rom/Eng.",
    runtime: "3:20",
    tag: "Lyric Video",
  },
  "assassins-creed-brotherhood-trailer": {
    url: "/media/assassins-creed-brotherhood-trailer.mp4",
    poster: "/content/video-assassins-creed-brotherhood.jpg",
    credit: "Assassin's Creed: Brotherhood \u2014 official trailer, Ubisoft.",
    runtime: "3:02",
    tag: "Trailer",
  },
  "vampire-diaries-teen-wolf-titles": {
    url: "/media/vampire-diaries-teen-wolf-titles.mp4",
    poster: "/content/video-vampire-diaries-titles.jpg",
    credit:
      "The Vampire Diaries \u2014 The CW. Fan-made main-title sequence built in the style of Teen Wolf's.",
    runtime: "0:44",
    tag: "Title Sequence",
  },
  "your-idol-kpop-demon-hunters": {
    url: "/media/your-idol-kpop-demon-hunters.mp4",
    poster: "/content/video-your-idol-fan-animation.jpg",
    credit: "KPop Demon Hunters \u2014 \u201cYour Idol\u201d. Fan animation.",
    runtime: "1:08",
    tag: "Fan Animation",
  },
};

export const AUDIO_LIBRARY = {
  "soundhelix-1": {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    credit: "SoundHelix \u2014 T. Sch\u00fcrger, free to use",
    runtime: "6:11",
    tag: "Podcast",
  },
  "soundhelix-2": {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    credit: "SoundHelix \u2014 T. Sch\u00fcrger, free to use",
    runtime: "7:04",
    tag: "Soundtrack",
  },
  "soundhelix-3": {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    credit: "SoundHelix \u2014 T. Sch\u00fcrger, free to use",
    runtime: "5:43",
    tag: "Interview",
  },
  "soundhelix-5": {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    credit: "SoundHelix \u2014 T. Sch\u00fcrger, free to use",
    runtime: "5:52",
    tag: "Session",
  },
  "soundhelix-8": {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    credit: "SoundHelix \u2014 T. Sch\u00fcrger, free to use",
    runtime: "5:24",
    tag: "Podcast",
  },
};

/** Fallback rotation for any playable piece that does not name its own file. */
export const VIDEO_SOURCES = Object.values(VIDEO_LIBRARY);
export const AUDIO_SOURCES = Object.values(AUDIO_LIBRARY);
