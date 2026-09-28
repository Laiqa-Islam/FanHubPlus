import { Link, useLoaderData } from "react-router";
import { Play, Headphones, ImageIcon } from "lucide-react";

import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { InkStrip, RegMark } from "@/components/press";
import { MediaTheatre } from "@/components/media/media-theatre";
import { cn } from "@/lib/utils";

const DESCRIPTION =
  "Trailers, breakdowns, timelapses, podcasts and soundtracks from every fandom channel, streaming in one place.";

const TABS = [
  { value: "", label: "Everything", icon: null },
  { value: "video", label: "Watch", icon: Play },
  { value: "audio", label: "Listen", icon: Headphones },
  { value: "image", label: "Galleries", icon: ImageIcon },
];

/** The three signals, cycled across the format pills. */
const TAB_INKS = ["var(--n1)", "var(--n2)", "var(--n3)", "var(--ch-kpop)"];

export default function MediaPage() {
  const { activeType, items, counts, totalCount } = useLoaderData();

  return (
    <div>
      <Meta title="Multimedia Center" description={DESCRIPTION} />
      <header className="relative border-b border-[var(--rule)]">
        <div className="mx-auto max-w-[88rem] px-5 pb-10 pt-8 sm:px-8">
          <Breadcrumbs trail={[{ label: "Multimedia" }]} />

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mark mb-3 text-[var(--n1)]">
                Multimedia · {totalCount} pieces
              </p>
              <h1 className="font-display text-[clamp(1.9rem,5.5vw,3.6rem)] font-black leading-[0.95]">
                Watch. Listen.
                <br />
                <span className="text-[var(--n2)] [--glow:var(--n2)] glow-text">
                  Loop it.
                </span>
              </h1>
              <p className="mt-5 max-w-xl border-l-2 border-[var(--n2)] pl-5 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
                Everything plays here — pick anything below and it loads into
                the screen above, then rolls on to the next when it finishes.
                Rate what you watch; the scores drive what surfaces across the
                site.
              </p>
            </div>
            <RegMark className="hidden text-[var(--ink-faint)] sm:block" />
          </div>

          {/* Format tabs — lit pills, one signal each, each carrying its count. */}
          <nav className="mt-9 flex flex-wrap gap-2" aria-label="Media formats">
            {TABS.map((tab, index) => {
              const active = activeType === tab.value;
              const tabInk = TAB_INKS[index % TAB_INKS.length];
              const count = counts[tab.value] ?? 0;
              return (
                <Link
                  key={tab.label}
                  to={tab.value ? `/media?type=${tab.value}` : "/media"}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.13em] transition-colors",
                    active
                      ? "text-[var(--void)]"
                      : "border-[var(--edge)] text-[var(--ink-soft)] hover:border-[var(--edge-strong)] hover:text-[var(--ink)]",
                  )}
                  style={
                    active
                      ? {
                          background: tabInk,
                          borderColor: tabInk,
                          boxShadow: `0 0 18px color-mix(in oklch, ${tabInk} 50%, transparent)`,
                        }
                      : undefined
                  }
                >
                  {tab.icon && <tab.icon className="h-3.5 w-3.5" aria-hidden />}
                  {tab.label}
                  <span
                    className={cn(
                      "tabular-nums",
                      active ? "opacity-70" : "text-[var(--ink-faint)]",
                    )}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        <InkStrip height={2} className="absolute inset-x-0 bottom-0" />
      </header>

      <div className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        <MediaTheatre key={activeType} items={items} />
      </div>
    </div>
  );
}
