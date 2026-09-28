import { Link } from "react-router";

import { Meta } from "@/components/meta";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <Meta title="Sign in" />
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to reach your dashboard, bookmarks and the channels you follow."
        footer={
          <>
            New here?{" "}
            <Link
              to="/register"
              className="font-semibold text-[var(--spot)] underline-offset-4 hover:underline"
            >
              Create a free account
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthShell>
    </>
  );
}
