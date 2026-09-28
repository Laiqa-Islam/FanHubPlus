import { Link } from "react-router";

import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-5">
      <Meta title="Not found" />
      <div className="max-w-lg text-center">
        {/* The rail, unlit — the signals are there, the channel is not. */}
        <div className="mx-auto mb-8 flex h-2 w-56 gap-1.5">
          {CATEGORIES.map((category) => (
            <span
              key={category.slug}
              aria-hidden
              className="block flex-1 rounded-full opacity-30"
              style={{ background: `var(--ch-${category.token})` }}
            />
          ))}
        </div>

        <p className="mark mb-4 text-[var(--n1)]">Channel 404</p>
        <h1 className="font-display text-[clamp(1.6rem,4.2vw,2.5rem)] font-black">
          Nothing on this frequency
        </h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
          The page you asked for isn&apos;t here. It may have moved, or the link
          may be stale.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/explore">Browse the explorer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
