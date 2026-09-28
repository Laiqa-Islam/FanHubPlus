import { Link } from "react-router";
import { usePathname } from "@/lib/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  CalendarDays,
  MessageSquare,
  Inbox,
  HelpCircle,
  UserCog,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/characters", label: "Characters", icon: Users },
  { href: "/admin/merch", label: "Merch", icon: Package },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/tickets", label: "Passes", icon: Ticket },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: UserCog },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap" aria-label="Admin sections">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            to={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-ml-[1.5px] inline-flex items-center gap-2 rounded-2xl border border-[var(--edge)] px-3.5 py-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.13em] transition-colors first:ml-0",
              active
                ? "bg-[var(--n1)] text-[var(--void)]"
                : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]",
            )}
          >
            <link.icon className="h-3.5 w-3.5" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
