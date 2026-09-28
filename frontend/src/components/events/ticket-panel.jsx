import { useActionState } from "react";
import { Link } from "react-router";
import {
  Ticket,
  Check,
  Download,
  CalendarPlus,
  ExternalLink,
  Loader2,
  Hourglass,
  XCircle,
} from "lucide-react";

import { applyForTicket, releaseTicket } from "@/actions/tickets";
import { Button } from "@/components/ui/button";

/**
 * The one thing an event listing was missing: something to do.
 *
 * A request is not a booking. Capacity is finite and a pass carries the
 * holder's name, so this sends the request to an editor and then reports
 * back on it — awaiting a decision, approved, or turned down with a reason.
 * Only an approved pass produces a stub.
 */
export function TicketPanel({
  slug,
  ink,
  signedIn,
  emailVerified,
  hasPassed,
  ticket,
  availability,
  externalUrl,
}) {
  const [claimState, claim, claiming] = useActionState(applyForTicket, null);
  const [releaseState, release, releasing] = useActionState(
    releaseTicket,
    null,
  );

  // The action reports the new state, so the panel can move on without
  // waiting for the page data to come back around.
  const released = releaseState?.ok && releaseState.status === "released";
  const status = released
    ? null
    : claimState?.ok
      ? claimState.status
      : (ticket?.status ?? null);

  const error = claimState && !claimState.ok ? claimState.error : "";
  const code = ticket?.code ?? "";

  const heading =
    status === "confirmed"
      ? "Your pass"
      : status === "pending"
        ? "Request sent"
        : status === "rejected"
          ? "Not approved"
          : "Passes";

  return (
    <aside
      className="overflow-hidden rounded-[1.4rem] border bg-[var(--paper-2)]"
      style={{ borderColor: `color-mix(in oklch, ${ink} 40%, transparent)` }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ background: `color-mix(in oklch, ${ink} 14%, transparent)` }}
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[var(--void)]"
          style={{ background: ink }}
        >
          <Ticket className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-display text-[1rem] font-bold leading-none">
            {heading}
          </p>
          <p className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            {availability.capacity > 0
              ? `${availability.confirmed} of ${availability.capacity} approved${
                  availability.pending > 0
                    ? ` · ${availability.pending} waiting`
                    : ""
                }`
              : "Free entry · no limit"}
          </p>
        </div>
      </div>

      <div className="p-5">
        {status === "confirmed" && (
          <>
            <p className="mark !text-[0.54rem] text-[var(--ink-faint)]">
              Booking code
            </p>
            <p
              className="mt-2 font-mono text-[1.15rem] font-bold tracking-[0.12em]"
              style={{ color: ink }}
            >
              {code}
            </p>
            <p className="mt-4 flex items-center gap-2 text-[0.86rem] text-[var(--ink-soft)]">
              <Check
                className="h-4 w-4 shrink-0"
                style={{ color: ink }}
                aria-hidden
              />
              Approved{ticket?.holderName ? ` for ${ticket.holderName}` : ""}.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <Button asChild size="sm">
                <Link to={`/tickets/${code}`}>
                  <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Open &amp; download pass
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={`/api/events/${slug}/calendar`}>
                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Add to calendar
                </a>
              </Button>
            </div>

            <ReleaseForm
              slug={slug}
              action={release}
              pending={releasing}
              label="Release this pass"
            />
          </>
        )}

        {status === "pending" && (
          <>
            <p className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
              <Hourglass
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: ink }}
                aria-hidden
              />

              <span>
                An editor is reviewing this. Your pass appears here and on your
                dashboard once it is approved — nothing to print yet.
              </span>
            </p>
            <ReleaseForm
              slug={slug}
              action={release}
              pending={releasing}
              label="Withdraw this request"
            />
          </>
        )}

        {status === "rejected" && (
          <>
            <p className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
              <XCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--n1)]"
                aria-hidden
              />

              <span>
                This request was not approved.
                {ticket?.decisionNote ? ` ${ticket.decisionNote}` : ""}
              </span>
            </p>
          </>
        )}

        {status === null && (
          <>
            {hasPassed ? (
              <p className="text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
                This one has already happened. The listing stays up for the
                record.
              </p>
            ) : availability.soldOut ? (
              <p className="text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
                Every place for this one is spoken for. Withdrawn requests
                sometimes free one up — the count above is live.
              </p>
            ) : (
              <>
                <p className="text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
                  {availability.remaining !== null
                    ? `${availability.remaining} places left. `
                    : ""}
                  Requests are reviewed by an editor. Once approved you get a
                  printable stub with a booking code and a scannable pass.
                </p>

                {signedIn ? (
                  <form action={claim} className="mt-5">
                    <input type="hidden" name="slug" value={slug} />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={claiming || !emailVerified}
                    >
                      {claiming ? (
                        <>
                          <Loader2
                            className="mr-1.5 h-3.5 w-3.5 animate-spin"
                            aria-hidden
                          />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Ticket className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Apply for a pass
                        </>
                      )}
                    </Button>
                    {!emailVerified && (
                      <p className="mt-3 text-[0.8rem] text-[var(--ink-faint)]">
                        Confirm your email first —{" "}
                        <Link
                          to="/verify-email"
                          className="underline underline-offset-4"
                        >
                          send a link
                        </Link>
                        .
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link to="/login">Sign in to apply</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/register">Join</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

            <div className="mt-5">
              <Button asChild size="sm" variant="outline">
                <a href={`/api/events/${slug}/calendar`}>
                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Add to calendar
                </a>
              </Button>
            </div>
          </>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-[var(--n1)] bg-[color-mix(in_oklch,var(--n1)_10%,transparent)] px-3 py-2 text-[0.82rem] text-[var(--ink)]">
            {error}
          </p>
        )}

        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 border-t border-[var(--rule)] pt-4 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--ink-faint)] transition-colors hover:text-[var(--n2)]"
          >
            Official ticket page
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}
      </div>
    </aside>
  );
}

function ReleaseForm({ slug, action, pending, label }) {
  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink-faint)] underline underline-offset-4 transition-colors hover:text-[var(--n1)] disabled:opacity-50"
      >
        {pending ? "Working…" : label}
      </button>
    </form>
  );
}
