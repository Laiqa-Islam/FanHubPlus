import { Link } from "react-router";

import { Meta } from "@/components/meta";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/password-forms";

export default function ForgotPasswordPage() {
  return (
    <>
      <Meta title="Reset your password" />
      <AuthShell
        title="Reset your password"
        subtitle="Tell us the email on your account and we'll send a link to set a new password."
        footer={
          <>
            Remembered it?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--spot)] underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </>
        }
      >
        <ForgotPasswordForm />
      </AuthShell>
    </>
  );
}
