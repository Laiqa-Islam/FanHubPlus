import { useState, useTransition } from "react";
import { toast } from "react-toastify";

import { setUserRole } from "@/actions/admin";
import { ROLES } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

/** Role management (SRS FR-11). */
export function UserRow({ user }) {
  const [role, setRole] = useState(user.role);
  const [isPending, startTransition] = useTransition();

  function change(next) {
    const previous = role;
    setRole(next);

    startTransition(async () => {
      const result = await setUserRole(user.id, next);
      if (result.ok) toast.success(result.message);
      else {
        setRole(previous);
        toast.error(result.message);
      }
    });
  }

  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-[var(--rule)] py-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] font-mono text-[0.68rem] font-bold uppercase">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials(user.name)
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[0.95rem] leading-none">
          {user.name}
          {user.isSelf && (
            <span className="ml-2 font-mono text-[0.58rem] tracking-[0.12em] text-[var(--spot-deep)]">
              you
            </span>
          )}
        </p>
        <p className="mt-1 truncate font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
          {user.email} · joined {user.joined} · {user.channels} channels ·{" "}
          {user.verified ? "verified" : "unverified"} · seen {user.lastSeen}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap">
        {ROLES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => change(value)}
            // Self-demotion is blocked server-side too; disabling here just
            // avoids offering an action that will be refused.
            disabled={isPending || role === value || user.isSelf}
            aria-pressed={role === value}
            className={cn(
              "-ml-[1.5px] rounded-2xl border border-[var(--edge)] px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors first:ml-0",
              role === value
                ? "bg-[var(--n1)] text-[var(--void)]"
                : "bg-[var(--paper)] hover:bg-[var(--paper-2)]",
              user.isSelf && "cursor-not-allowed opacity-45",
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </li>
  );
}
