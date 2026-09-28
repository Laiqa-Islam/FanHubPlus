import { Image } from "@/components/ui/image";

/**
 * The character dossier — the flooded panel, its section index, the dossier
 * rows and the meters.
 *
 * Kept presentational and free of data access so the same markup can be
 * rendered from a fixture. The profile page fetches, maps a document onto
 * `CharacterDossierData`, and passes its own controls in through `actions`.
 */

/** Matches the order `stats` is stored in — see scripts/data/characters.ts. */
const STAT_KEYS = ["Power", "Speed", "Chaos", "Style"];

/** The three signals, so consecutive meters never share a colour. */
const METER_INKS = ["var(--n1)", "var(--n2)", "var(--n3)"];

/** Drops rows with nothing in them, so a thin record renders short, not broken. */
export function visibleRows(rows) {
  return rows.filter((row) =>
    row.list ? row.list.length > 0 : Boolean(row.value),
  );
}
export function CharacterDossier({ data, actions }) {
  const { accent } = data;
  const rows = visibleRows(data.rows);
  const stats = data.stats ?? [];
  return (
    <>
      {/*
        The dossier card.
          The panel is flooded with a *deep* mix of the character's signal
        rather than the raw colour: Neon Oni's rule is that a signal is a line
        and a glow, not a flood, and a full-strength fill would also put light
        text on a mid-tone. The render sits in its own window that rides up
        over the panel's top edge (`lg:-mt-24`), which is what gives the
        reference layout its "figure breaking the frame" feel without needing
        a cut-out with real transparency.
       */}
      <section
        className="relative mt-4 rounded-[1.75rem] border sm:mt-16"
        style={{
          background: `
            radial-gradient(120% 90% at 78% 0%, color-mix(in oklch, ${accent} 42%, transparent), transparent 64%),
            linear-gradient(145deg, color-mix(in oklch, ${accent} 32%, var(--paper-3)), color-mix(in oklch, ${accent} 8%, var(--paper-3)) 72%)`,
          borderColor: `color-mix(in oklch, ${accent} 45%, transparent)`,
          boxShadow: `0 0 60px color-mix(in oklch, ${accent} 18%, transparent)`,
        }}
      >
        <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)_auto]">
          {/* ── Identity ─────────────────────────────────────────────── */}
          <div className="order-2 flex flex-col gap-5 lg:order-1">
            <div className="flex items-center gap-4">
              {/* The seal: a square turned 45°, with the glyph turned back. */}
              <span
                aria-hidden
                className="grid h-12 w-12 shrink-0 rotate-45 place-items-center rounded-lg border-2"
                style={{
                  borderColor: accent,
                  boxShadow: `0 0 18px color-mix(in oklch, ${accent} 50%, transparent), inset 0 0 14px color-mix(in oklch, ${accent} 25%, transparent)`,
                }}
              >
                {/* Unbounded carries no CJK, so the seal opts out of the
                    display face and takes the system's own CJK stack. Two
                    glyphs stack; one sits on a single line. */}
                <span
                  className="-rotate-45 text-center text-[0.95rem] font-semibold leading-[1]"
                  style={{
                    color: accent,
                    fontFamily:
                      '"Noto Sans JP", "Yu Gothic", "Hiragino Sans", "Microsoft YaHei", sans-serif',
                    writingMode:
                      (data.sealMark ?? "").length > 1
                        ? "vertical-rl"
                        : undefined,
                  }}
                >
                  {data.sealMark || "呪"}
                </span>
              </span>
              <span className="font-display text-[1.3rem] font-bold tracking-[0.06em] text-[var(--ink-soft)]">
                Grade
              </span>
            </div>

            {data.grade && (
              <p
                className="font-mono text-[0.68rem] uppercase tracking-[0.34em]"
                style={{
                  color: accent,
                }}
              >
                {data.grade}
              </p>
            )}

            <div>
              <h1 className="font-display text-[clamp(1.6rem,4.2vw,2.9rem)] font-black uppercase leading-[0.95] tracking-[-0.02em]">
                {data.name}
              </h1>
              {data.kanji && (
                <p className="mt-2 font-mono text-[0.85rem] text-[var(--ink-soft)]">
                  （{data.kanji}）
                </p>
              )}
            </div>

            <p className="max-w-md text-[0.98rem] uppercase leading-relaxed tracking-[0.01em] text-[var(--ink-soft)]">
              {data.bio}
            </p>

            {actions && (
              <div className="mt-1 flex flex-wrap items-center gap-3">
                {actions}
              </div>
            )}
          </div>

          {/* ── The render ───────────────────────────────────────────── */}
          <div className="order-1 lg:order-2 lg:-mt-24">
            <div
              className="relative mx-auto aspect-[3/4] w-full max-w-[22rem] overflow-hidden rounded-[1.5rem] border"
              style={{
                borderColor: `color-mix(in oklch, ${accent} 55%, transparent)`,
                boxShadow: `0 0 45px color-mix(in oklch, ${accent} 30%, transparent)`,
              }}
            >
              {data.imageUrl && (
                <Image
                  src={data.imageUrl}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 22rem"
                  className="plate object-cover"
                />
              )}
              {/* The render dissolves into the panel at its foot rather than
                  stopping on a hard edge. */}
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(0deg, color-mix(in oklch, ${accent} 42%, transparent), transparent 55%)`,
                }}
              />
            </div>
          </div>

          {/* ── The ABOUT index ──────────────────────────────────────── */}
          <nav
            aria-label="Dossier sections"
            className="order-3 flex flex-col gap-3 lg:min-w-[11rem] lg:pl-4 lg:text-right"
          >
            <p className="flex items-center gap-2 font-display text-[1.35rem] font-black lg:justify-end">
              <span
                aria-hidden
                style={{
                  color: accent,
                }}
              >
                •
              </span>
              ABOUT
            </p>
            <ul className="flex flex-col gap-2.5">
              {rows.map((row) => (
                <li key={row.id}>
                  <a
                    href={`#${row.id}`}
                    className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                  >
                    {row.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* ── The dossier itself ───────────────────────────────────────── */}
      {rows.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <section
              key={row.id}
              id={row.id}
              className="scroll-mt-24 rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-5"
            >
              <h2
                className="font-mono text-[0.62rem] uppercase tracking-[0.2em]"
                style={{
                  color: accent,
                }}
              >
                {row.label}
              </h2>
              {row.list ? (
                <ul className="mt-3 flex flex-col gap-2">
                  {row.list.map((entry) => (
                    <li
                      key={entry}
                      className="flex gap-2.5 text-[0.92rem] leading-snug"
                    >
                      <span
                        aria-hidden
                        className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          background: accent,
                          boxShadow: `0 0 7px ${accent}`,
                        }}
                      />
                      <span className="text-[var(--ink-soft)]">{entry}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                  {row.value}
                </p>
              )}
            </section>
          ))}
        </div>
      )}

      {/* ── The meters ───────────────────────────────────────────────── */}
      {stats.length > 0 && (
        <section className="mt-4 rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-6">
          <h2
            className="mark mb-5"
            style={{
              color: accent,
            }}
          >
            Fan Hub read
          </h2>
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {stats.slice(0, STAT_KEYS.length).map((value, index) => {
              const from = METER_INKS[index % METER_INKS.length];
              const to = METER_INKS[(index + 1) % METER_INKS.length];
              return (
                <div
                  key={STAT_KEYS[index]}
                  className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.25rem] items-center gap-3"
                >
                  <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    {STAT_KEYS[index]}
                  </dt>
                  <dd
                    className="h-2.5 overflow-hidden rounded-full bg-[var(--paper)]"
                    role="meter"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={STAT_KEYS[index]}
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, value))}%`,
                        background: `linear-gradient(90deg, ${from}, ${to})`,
                        boxShadow: `0 0 14px ${to}`,
                      }}
                    />
                  </dd>
                  <span className="text-right font-display text-[0.8rem] font-bold tabular-nums">
                    {value}
                  </span>
                </div>
              );
            })}
          </dl>
          <p className="mt-5 border-t border-[var(--rule)] pt-4 text-[0.78rem] leading-relaxed text-[var(--ink-faint)]">
            These four meters are Fan Hub Plus&apos;s own editorial read, not a
            figure from any official source — they exist to be argued with.
            {data.signature && (
              <>
                {" "}
                Signature:{" "}
                <span className="text-[var(--ink-soft)]">{data.signature}</span>
                .
              </>
            )}
            {data.debutYear ? ` First appeared ${data.debutYear}.` : ""}
          </p>
        </section>
      )}
    </>
  );
}
