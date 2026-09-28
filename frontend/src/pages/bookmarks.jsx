import { Link, useLoaderData } from "react-router";
import { Bookmark } from "lucide-react";

import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { InkStrip, Misreg } from "@/components/press";
import { ClippingRow } from "@/components/bookmarks/clipping-row";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "", label: "Everything", key: "all" },
  { value: "content", label: "Pieces", key: "content" },
  { value: "character", label: "Characters", key: "character" },
  { value: "merchandise", label: "Merch", key: "merchandise" },
  { value: "event", label: "Events", key: "event" },
];

export default function BookmarksPage() {
  const { activeType, rows, counts } = useLoaderData();

  return (
    <div>
      <Meta title="Your saves" />
      <header className="border-b border-[var(--rule-strong)]">
        <div className="mx-auto max-w-4xl px-5 pb-8 pt-8">
          <Breadcrumbs
            trail={[
              { href: "/dashboard", label: "Dashboard" },
              { label: "Saved" },
            ]}
          />

          <p className="mark mb-3">Your file · {counts.all ?? 0} saved</p>
          <Misreg
            as="h1"
            className="text-[clamp(1.7rem,4.4vw,2.6rem)]"
            ghostInk="var(--n2)"
          >
            Your saves
          </Misreg>
          <p className="mt-5 max-w-lg border-l-2 border-[var(--n1)] pl-5 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
            Everything you&apos;ve kept, with your own notes attached. Only you
            can see the notes.
          </p>

          <nav className="mt-8 flex flex-wrap" aria-label="Saved types">
            {TABS.map((tab) => {
              const count = counts[tab.key] ?? 0;
              const active = activeType === tab.value;
              return (
                <Link
                  key={tab.label}
                  to={
                    tab.value ? `/bookmarks?type=${tab.value}` : "/bookmarks"
                  }
                  className={cn(
                    "-ml-[1.5px] inline-flex items-center gap-2 rounded-2xl border border-[var(--edge)] px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors first:ml-0",
                    active
                      ? "bg-[var(--n1)] text-[var(--void)]"
                      : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]",
                  )}
                >
                  {tab.label}
                  <span className="tabular-nums opacity-70">{count}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <InkStrip height={5} />
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--edge-strong)] px-6 py-20 text-center">
            <Bookmark
              className="mx-auto h-8 w-8 text-[var(--ink-faint)]"
              aria-hidden
            />

            <p className="mt-5 font-display text-[1.30rem] leading-none">
              Nothing saved yet
            </p>
            <p className="mx-auto mt-3 max-w-sm text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Hit the save mark on any piece, character, reel or showcase item
              and it lands here — with room for a note about why you kept it.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/explore">Browse the board</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/media">Watch something</Link>
              </Button>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col border-t border-[var(--rule)]">
            {rows.map((row) => (
              <ClippingRow key={row.bookmarkId} row={row} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
