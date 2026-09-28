import { useState, useTransition } from "react";
import { Bug, Lightbulb, HelpCircle, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

import { updateFeedbackStatus } from "@/actions/feedback";
import { cn } from "@/lib/utils";

const ICON = { bug: Bug, suggestion: Lightbulb, query: HelpCircle };

const STATUS_INK = {
  open: "var(--flag)",
  "in-review": "var(--spot-2)",
  resolved: "var(--ch-gaming)",
};

/** One report, with inline triage controls (SRS FR-11). */
export function FeedbackRow({ item }) {
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.adminNote);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const Icon = ICON[item.type] ?? HelpCircle;

  function move(next) {
    const previous = status;
    setStatus(next);

    startTransition(async () => {
      const result = await updateFeedbackStatus(item.id, next, note);
      if (result.ok) toast.success(result.message);
      else {
        setStatus(previous);
        toast.error(result.message);
      }
    });
  }

  return (
    <li className="border-b border-[var(--rule)] py-4">
      <div className="flex flex-wrap items-start gap-4">
        <span
          aria-hidden
          className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-2xl border border-[var(--edge)]"
          style={{ background: STATUS_INK[status] ?? "var(--paper-2)" }}
        >
          <Icon className="h-4 w-4 text-[var(--void)]" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            <span className="border border-[var(--rule-strong)] px-1.5 py-0.5">
              {item.type}
            </span>
            <span>{status}</span>
            <span>{item.at}</span>
          </p>

          <p className="mt-1.5 font-display text-[0.95rem] leading-[0.95]">
            {item.subject}
          </p>

          <p className="mt-1 font-mono text-[0.64rem] text-[var(--ink-faint)]">
            {item.name || "Anonymous"}
            {item.email && ` · ${item.email}`}
          </p>

          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            className="mt-2 inline-flex items-center gap-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:text-[var(--spot-deep)]"
          >
            {expanded ? "Hide" : "Read"} message
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                expanded && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {expanded && (
            <>
              <p className="mt-3 whitespace-pre-line border-l-2 border-[var(--rule-strong)] bg-[var(--paper-2)] p-4 text-[0.92rem] leading-relaxed">
                {item.message}
              </p>

              <label className="sr-only" htmlFor={`note-${item.id}`}>
                Internal note
              </label>
              <input
                id={`note-${item.id}`}
                value={note}
                maxLength={500}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Internal note…"
                className="mt-3 w-full border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[0.86rem] focus:border-[var(--spot)] focus:outline-none"
              />
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-0">
          {["open", "in-review", "resolved"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => move(value)}
              disabled={isPending || status === value}
              aria-pressed={status === value}
              className={cn(
                "-ml-[1.5px] rounded-2xl border border-[var(--edge)] px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors first:ml-0 disabled:cursor-default",
                status === value
                  ? "bg-[var(--n1)] text-[var(--void)]"
                  : "bg-[var(--paper)] hover:bg-[var(--paper-2)]",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </li>
  );
}
