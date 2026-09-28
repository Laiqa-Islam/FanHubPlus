import { useActionState } from "react";
import { Check, X, Loader2 } from "lucide-react";

import { decideTicket } from "@/actions/tickets";

/**
 * Approve or turn down one request.
 *
 * The note only travels with a rejection — an approval that needs explaining
 * is an approval that should have been a rejection, and an optional comment
 * box on the happy path is just another thing to skip past.
 */
export function TicketDecision({ code }) {
  const [state, decide, pending] = useActionState(decideTicket, null);

  return (
    <form action={decide} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="code" value={code} />
      <input
        name="note"
        placeholder="Reason, if declining"
        maxLength={300}
        className="min-w-0 flex-1 rounded-xl border border-[var(--edge)] bg-[var(--paper)] px-3 py-1.5 text-[0.8rem] placeholder:text-[var(--ink-faint)] focus:border-[var(--n2)] focus:outline-none"
      />

      <button
        type="submit"
        name="decision"
        value="approve"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--n2)] px-3 py-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--void)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Check className="h-3.5 w-3.5" aria-hidden />
        )}
        Approve
      </button>

      <button
        type="submit"
        name="decision"
        value="reject"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--edge)] px-3 py-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:border-[var(--n1)] hover:text-[var(--n1)] disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Decline
      </button>

      {state && !state.ok && (
        <p className="w-full text-[0.78rem] text-[var(--n1)]">{state.error}</p>
      )}
    </form>
  );
}
