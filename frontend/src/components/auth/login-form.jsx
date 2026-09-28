import { Link } from "react-router";
import { useActionState, useEffect } from "react";
import { useSearchParams } from "@/lib/navigation";
import { toast } from "react-toastify";

import { login } from "@/actions/auth";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [state, action, pending] = useActionState(login, undefined);

  // One-off confirmations handed over by redirect from other flows.
  useEffect(() => {
    if (searchParams.get("reset") === "1") {
      toast.success("Password updated. Sign in with your new password.");
    }
    if (searchParams.get("verified") === "1") {
      toast.success("Email confirmed. Welcome aboard.");
    }
    if (searchParams.get("session") === "expired") {
      toast.info("Your session is no longer valid. Please sign in again.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        error={state?.errors?.email}
      />

      <div>
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          error={state?.errors?.password}
        />

        <Link
          to="/forgot-password"
          className="mt-2.5 inline-block text-[0.82rem] text-[var(--ink-soft)] underline-offset-4 transition-colors hover:text-[var(--spot)] hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      <Button type="submit" size="lg" loading={pending} className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  );
}
