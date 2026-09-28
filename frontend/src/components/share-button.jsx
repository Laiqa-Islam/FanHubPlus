import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

/**
 * Sharing (SRS FR-9). Uses the Web Share sheet where the browser offers one,
 * and falls back to copying the URL to the clipboard everywhere else.
 */
export function ShareButton({ title, className }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // AbortError just means the user dismissed the sheet — not a failure
        // worth reporting. Anything else falls through to the clipboard.
        if (error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(
        "Couldn't copy the link. Copy it from the address bar instead.",
      );
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[0.74rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:text-[var(--spot)]",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Share2 className="h-3.5 w-3.5" aria-hidden />
      )}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
