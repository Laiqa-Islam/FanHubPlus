import { Link, useLoaderData } from "react-router";
import { ChevronRight, Shield, ArrowUpRight } from "lucide-react";

import { Meta } from "@/components/meta";
import { ProfileForm } from "@/components/profile/profile-form";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useLoaderData();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Meta title="Profile & preferences" />
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
          <li>
            <Link
              to="/dashboard"
              className="transition-colors hover:text-[var(--spot)]"
            >
              Dashboard
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li className="text-[var(--ink)]">Profile</li>
        </ol>
      </nav>

      <header className="mb-10">
        <h1 className="font-display text-[clamp(1.65rem,4.2vw,2.3rem)]">
          Profile & preferences
        </h1>
        <p className="mt-3 text-[0.96rem] text-[var(--ink-soft)]">
          Member since {formatDate(user.createdAt)}
          {user.emailVerified
            ? " · email confirmed"
            : " · email not yet confirmed"}
        </p>
      </header>

      {/* Admins reach the control panel from the header menu and the
           dashboard; this is the third place they would look for it. */}
      {user.role === "admin" && (
        <Link
          to="/admin"
          className="group mb-10 flex items-center gap-4 rounded-2xl border border-[color-mix(in_oklch,var(--n1)_35%,transparent)] bg-[var(--paper-2)] p-4 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--n1)]"
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[var(--void)]"
            style={{
              background: "var(--n1)",
              boxShadow:
                "0 0 20px color-mix(in oklch, var(--n1) 45%, transparent)",
            }}
          >
            <Shield className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[0.98rem] font-bold leading-none">
              Control panel
            </span>
            <span className="mt-1.5 block text-[0.84rem] text-[var(--ink-soft)]">
              Usage statistics and every editor.
            </span>
          </span>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-[var(--n1)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      )}

      <ProfileForm user={user} />
    </div>
  );
}
