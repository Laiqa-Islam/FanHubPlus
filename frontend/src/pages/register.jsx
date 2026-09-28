import { Link } from "react-router";

import { Meta } from "@/components/meta";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <>
      <Meta title="Create your account" />
      <AuthShell
        title="Join Fan Hub Plus"
        subtitle="Free, ad-free, and yours in about thirty seconds. Pick your fandoms after you're in."
        footer={
          <>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--spot)] underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        }
      >
        <RegisterForm />
      </AuthShell>
    </>
  );
}
