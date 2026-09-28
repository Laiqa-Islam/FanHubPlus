import { Link, Outlet, useLoaderData } from "react-router";
import { InkStrip } from "@/components/press";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Every admin route sits under this layout, which gates on the admin role.
 *
 * The gate is defence in depth rather than the only check: the route gate
 * already redirects non-admins away from `/admin`, and each server action calls
 * `requireAdmin()` itself. A layout alone would not be enough, because a
 * layout does not control whether its child routes render — so every admin
 * page's loader calls `requireAdmin()` too. This layout's own loader
 * (`/admin/_layout`) runs the check and returns the admin's name.
 */
export default function AdminLayout() {
  const { admin } = useLoaderData();

  return (
    <div>
      <div className="border-b border-[var(--rule)] bg-[var(--paper-3)]">
        <div className="mx-auto flex max-w-[92rem] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] sm:px-8">
          <Link to="/admin" className="font-semibold text-[var(--n1)]">
            Control panel
          </Link>
          <span className="text-[var(--ink-faint)]">
            Signed in as {admin.name}
          </span>
          <Link
            to="/"
            className="ml-auto opacity-70 transition-opacity hover:opacity-100"
          >
            ← Back to the site
          </Link>
        </div>
      </div>
      <InkStrip height={2} />

      <div className="mx-auto max-w-[92rem] px-5 py-8 sm:px-8">
        <AdminNav />
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
