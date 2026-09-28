import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

import { register } from "@/actions/auth";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  useEffect(() => {
    if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Input
        label="Display name"
        name="name"
        autoComplete="name"
        placeholder="How other fans see you"
        required
        error={state?.errors?.name}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        error={state?.errors?.email}
        hint="We'll send a confirmation link here."
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
        error={state?.errors?.password}
        hint="Use 8+ characters with a letter and a number."
      />

      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Type it once more"
        required
        error={state?.errors?.confirmPassword}
      />

      <Button type="submit" size="lg" loading={pending} className="mt-1 w-full">
        Create account
      </Button>

      <p className="text-[0.78rem] leading-relaxed text-[var(--ink-faint)]">
        Fan Hub Plus showcases merchandise for discovery only — we never ask for
        payment details.
      </p>
    </form>
  );
}
