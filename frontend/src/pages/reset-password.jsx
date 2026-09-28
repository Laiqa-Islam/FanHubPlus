import { Link, useSearchParams } from "react-router";

import { Meta } from "@/components/meta";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  ResetPasswordForm,
  ForgotPasswordForm,
} from "@/components/auth/password-forms";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  if (!token) {
    return (
      <>
        <Meta title="Choose a new password" />
        <AuthShell
          title="This link is incomplete"
          subtitle="The reset link is missing its token. Request a fresh one and we'll send another."
        >
          <ForgotPasswordForm />
        </AuthShell>
      </>
    );
  }

  return (
    <>
      <Meta title="Choose a new password" />
      <AuthShell
        title="Choose a new password"
        subtitle="Pick something you haven't used here before. You'll sign in again straight after."
        footer={
          <Link
            to="/login"
            className="font-semibold text-[var(--spot)] underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        }
      >
        <ResetPasswordForm token={token} />
      </AuthShell>
    </>
  );
}
