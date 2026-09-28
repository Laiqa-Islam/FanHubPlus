import { useActionState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

import { submitFeedback } from "@/actions/feedback";
import { FEEDBACK_TYPES } from "@/lib/constants";
import { Input, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

/** Dynamic, categorised feedback form (SRS FR-8). */
export function FeedbackForm({ signedIn }) {
  const [state, action, pending] = useActionState(submitFeedback, undefined);

  useEffect(() => {
    if (state?.success && state.message) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  if (state?.success) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] p-6">
        <CheckCircle2
          className="mt-0.5 h-5 w-5 shrink-0 text-[var(--spot-2)]"
          aria-hidden
        />

        <div>
          <p className="font-display text-[1.01rem] leading-none">Sent</p>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">
            {state.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Send another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <Select
        label="What kind of message is this?"
        name="type"
        required
        error={state?.errors?.type}
      >
        <option value="">Choose one…</option>
        {FEEDBACK_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>

      <Input
        label="Subject"
        name="subject"
        required
        maxLength={120}
        placeholder="One line on what this is about"
        error={state?.errors?.subject}
      />

      <Textarea
        label="Message"
        name="message"
        required
        rows={8}
        placeholder="What happened, or what would you like to see?"
        error={state?.errors?.message}
        hint="At least 20 characters."
      />

      {/* Signed-in members are identified by their session, so these are only
           asked of visitors. */}
      {!signedIn && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Your name (optional)"
            name="name"
            maxLength={60}
            placeholder="So we know who we're replying to"
            error={state?.errors?.name}
          />

          <Input
            label="Your email (optional)"
            name="email"
            type="email"
            maxLength={160}
            placeholder="Only if you'd like a reply"
            error={state?.errors?.email}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-6">
        <p className="text-[0.82rem] leading-relaxed text-[var(--ink-faint)]">
          {signedIn
            ? "Sent with your account details attached."
            : "You can send this without an account."}
        </p>
        <Button type="submit" size="lg" loading={pending}>
          Send it
        </Button>
      </div>
    </form>
  );
}
