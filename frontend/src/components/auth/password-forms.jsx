import { useActionState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

import {
  requestPasswordReset,
  resetPassword,
  resendVerification,
} from "@/actions/auth";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

/** Step 1 — ask for the reset link. */
export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );

  useEffect(() => {
    if (state?.success && state.message) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  if (state?.success) {
    return <SentNotice message={state.message ?? "Check your inbox."} />;
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        error={state?.errors?.email}
        hint="We'll send a link that works once and expires in an hour."
      />

      <Button type="submit" size="lg" loading={pending} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}

/** Step 2 — choose the new password, carrying the token from the email link. */
export function ResetPasswordForm({ token }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);

  useEffect(() => {
    if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="token" value={token} />

      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
        error={state?.errors?.password}
        hint="Use 8+ characters with a letter and a number."
      />

      <Input
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Type it once more"
        required
        error={state?.errors?.confirmPassword}
      />

      <Button type="submit" size="lg" loading={pending} className="w-full">
        Update password
      </Button>
    </form>
  );
}

/** Requests a fresh confirmation email. */
export function ResendVerificationForm({ defaultEmail = "" }) {
  const [state, action, pending] = useActionState(
    resendVerification,
    undefined,
  );

  useEffect(() => {
    if (state?.success && state.message) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  if (state?.success) {
    return <SentNotice message={state.message ?? "Link sent."} />;
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={defaultEmail}
        placeholder="you@example.com"
        required
        error={state?.errors?.email}
      />

      <Button
        type="submit"
        loading={pending}
        variant="outline"
        className="w-full"
      >
        Send a new link
      </Button>
    </form>
  );
}

function SentNotice({ message }) {
  return (
    <div className="flex items-start gap-3 border border-[var(--spot-2)]/35 bg-[var(--spot-2-wash)] p-5">
      <CheckCircle2
        className="mt-0.5 h-5 w-5 shrink-0 text-[var(--spot-2)]"
        aria-hidden
      />

      <div>
        <p className="font-semibold text-[var(--ink)]">Check your inbox</p>
        <p className="mt-1 text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
          {message}
        </p>
      </div>
    </div>
  );
}
