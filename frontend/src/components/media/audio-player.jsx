import { useRef, useState, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

/**
 * Audio player for podcasts and soundtracks (SRS FR-5).
 *
 * Styled as a cassette insert: a bar of animated level meters standing in for
 * a waveform. The meters are decorative — computing a real waveform would
 * mean downloading and decoding the whole file just to draw it.
 */
export function AudioPlayer({
  src,
  title,
  ink = "var(--spot)",
  autoPlay = false,
  onEnded,
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState(false);

  // See the note in VideoPlayer: kept in a ref so the listener effect can
  // stay on empty deps rather than re-attaching on every progress tick.
  const endedRef = useRef(onEnded);
  useEffect(() => {
    endedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // As with video: a stalled source never fires `error`, so without this the
    // player would sit silently at 0:00 forever.
    const stallTimer = setTimeout(() => {
      if (audio.readyState === 0) setFailed(true);
    }, 20_000);

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => {
      setCurrent(audio.currentTime);
      if (audio.duration)
        setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onError = () => setFailed(true);
    const onEndedEvent = () => endedRef.current?.();

    audio.addEventListener("ended", onEndedEvent);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("error", onError);

    return () => {
      clearTimeout(stallTimer);
      audio.removeEventListener("ended", onEndedEvent);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    audioRef.current?.play().catch(() => {});
  }, [autoPlay, src]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }

  function nudge(seconds) {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, audio.currentTime + seconds);
  }

  if (failed) {
    return (
      <div className="rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] p-6 text-center">
        <p className="font-display text-[0.95rem]">
          This track won&apos;t load
        </p>
        <p className="mt-1.5 text-[0.88rem] text-[var(--ink-soft)]">
          The audio source is unreachable right now.
        </p>
      </div>
    );
  }

  return (
    <figure className="rounded-2xl border border-[var(--edge)] bg-[var(--paper)] shadow-[var(--lift-md)]">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4 p-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[var(--edge)] text-[var(--void)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[var(--lift-md)]"
          style={{ background: ink }}
        >
          {playing ? (
            <Pause className="h-6 w-6 fill-current" aria-hidden />
          ) : (
            <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[0.95rem] leading-none">
            {title}
          </p>

          {/* Level meters. Bars past the playhead sit flat and grey. */}
          <div aria-hidden className="mt-2.5 flex h-8 items-end gap-[2px]">
            {METER_HEIGHTS.map((height, index) => {
              const passed = (index / METER_HEIGHTS.length) * 100 <= progress;
              return (
                <span
                  key={index}
                  className="flex-1 transition-[height,background-color] duration-150"
                  style={{
                    height:
                      playing && passed
                        ? `${height}%`
                        : `${Math.max(12, height * 0.32)}%`,
                    background: passed ? ink : "var(--rule)",
                    animation:
                      playing && passed
                        ? `press-pulse ${700 + (index % 5) * 130}ms ease-in-out infinite`
                        : undefined,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[0.64rem] tabular-nums text-[var(--ink-faint)]">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            type="button"
            onClick={() => nudge(-15)}
            aria-label="Back 15 seconds"
            className="grid h-8 w-8 place-items-center rounded-2xl border border-[var(--edge)] transition-colors hover:bg-[var(--paper-2)]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => nudge(30)}
            aria-label="Forward 30 seconds"
            className="grid h-8 w-8 place-items-center rounded-2xl border border-[var(--edge)] transition-colors hover:bg-[var(--paper-2)]"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </figure>
  );
}

// Fixed pseudo-random heights: stable across renders, unlike Math.random(),
// which would differ between server and client and break hydration.
const METER_HEIGHTS = [
  38, 62, 45, 80, 55, 92, 48, 70, 35, 85, 58, 44, 76, 52, 88, 41, 66, 95, 50,
  72, 39, 60, 83, 47, 68, 54, 90, 42, 75, 57, 64, 86, 49, 71, 36, 79, 53, 67,
  94, 46,
];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
