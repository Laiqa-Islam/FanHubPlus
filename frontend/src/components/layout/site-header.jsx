import { Link } from "react-router";
import { usePathname } from "@/lib/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Shield,
  PenLine,
  Bookmark,
  ChevronDown,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { BrandMark } from "@/components/brand/mark";

import { CATEGORIES } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";
import { InkStrip } from "@/components/press";
import { AccessibilityMenu } from "@/components/layout/accessibility-menu";
import { CartButton } from "@/components/cart/cart-button";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";

/** The three signals, cycled across the nav so the bar reads as a strip. */
const NAV_INKS = ["var(--n1)", "var(--n2)", "var(--n3)"];

const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/media", label: "Multimedia" },
  { href: "/characters", label: "Characters" },
  { href: "/events", label: "Events" },
  { href: "/merch", label: "Merch" },
  { href: "/upcoming", label: "Upcoming" },
];

/**
 * The sign over the door: a capsule that floats over the page rather than a
 * bar ruled across it.
 *
 * The outer element stays full-width and sticky so the hit area and the
 * stacking context behave normally; the visible pill is the inner rounded
 * surface, inset from the page edge. `backdrop-blur` is doing real work —
 * the page's own neon gradients sit behind it, so a solid fill would cut a
 * flat rectangle out of the glow.
 */
export function SiteHeader({ user }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 px-3 pb-2 pt-3 sm:px-5 sm:pt-4">
      <div
        className="mx-auto flex h-14 max-w-[80rem] items-center gap-3 rounded-full border px-3 backdrop-blur-xl sm:gap-4 sm:pl-4 sm:pr-3"
        style={{
          background: "color-mix(in oklch, var(--paper-2) 82%, transparent)",
          borderColor: "color-mix(in oklch, var(--n1) 28%, transparent)",
          // One soft magenta bloom under the capsule, plus an inner highlight
          // along its top edge so it reads as a lit object rather than a cut-out.
          boxShadow:
            "0 10px 34px rgba(0,0,0,0.55), 0 0 30px color-mix(in oklch, var(--n1) 14%, transparent), inset 0 1px 0 color-mix(in oklch, var(--ink) 10%, transparent)",
        }}
      >
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <BrandMark className="h-9 w-9 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="hidden font-display text-[0.95rem] font-black leading-none tracking-[0.02em] sm:block">
            FANHUB<span className="text-[var(--n1)]">.</span>
          </span>
        </Link>

        <nav
          className="hidden min-w-0 items-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          <ChannelMenu pathname={pathname} />
          {NAV_LINKS.map((link, index) => {
            const active = pathname.startsWith(link.href);
            // The active pill cycles the three signals by position, so no two
            // neighbouring screens ever light up in the same colour.
            const ink = NAV_INKS[index % NAV_INKS.length];
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3.5 py-2 text-[0.82rem] font-medium transition-colors",
                  active
                    ? "text-[var(--void)]"
                    : "text-[var(--ink-soft)] hover:bg-[color-mix(in_oklch,var(--ink)_8%,transparent)] hover:text-[var(--ink)]",
                )}
                style={
                  active
                    ? {
                        background: ink,
                        boxShadow: `0 0 18px color-mix(in oklch, ${ink} 45%, transparent)`,
                      }
                    : undefined
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <AccessibilityMenu />
          <CartButton />

          {user ? (
            <AccountMenu user={user} />
          ) : (
            // The reference ends its pill with one filled capsule; this is it.
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                to="/login"
                className="rounded-full px-3 py-2 text-[0.82rem] font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[var(--ink)] px-4 py-2 text-[0.82rem] font-semibold text-[var(--void)] transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_0_22px_color-mix(in_oklch,var(--ink)_35%,transparent)]"
              >
                Join
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--edge-strong)] text-[var(--ink-soft)] transition-colors hover:border-[var(--n1)] hover:text-[var(--n1)] lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <InkStrip height={2} />

      {mobileOpen && <MobileNav user={user} pathname={pathname} />}
    </header>
  );
}

function ChannelMenu({ pathname }) {
  const active = pathname.startsWith("/category");
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[0.82rem] font-medium transition-colors",
            active
              ? "bg-[var(--n1)] text-[var(--void)] shadow-[0_0_18px_color-mix(in_oklch,var(--n1)_45%,transparent)]"
              : "text-[var(--ink-soft)] hover:bg-[color-mix(in_oklch,var(--ink)_8%,transparent)] hover:text-[var(--ink)]",
          )}
        >
          Channels
          <ChevronDown
            className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={14}
          align="start"
          className="z-[70] w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-[var(--edge)] p-2 shadow-[var(--lift-lg)] backdrop-blur-xl data-[state=open]:motion-safe:animate-[menu-in_.16s_ease-out]"
          style={{
            background: "color-mix(in oklch, var(--paper-2) 94%, transparent)",
          }}
        >
          <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
            <p className="mark !text-[0.58rem] text-[var(--n2)]">
              Eight channels
            </p>
            <DropdownMenu.Item asChild>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink-faint)] outline-none transition-colors hover:text-[var(--ink)] focus-visible:text-[var(--ink)]"
              >
                Browse all
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </Link>
            </DropdownMenu.Item>
          </div>

          {/* Two columns of tiles rather than eight ruled rows: each channel
               gets its own surface, its tagline, and a reason for its colour
               to be on screen. */}
          <div className="grid gap-1.5 sm:grid-cols-2">
            {CATEGORIES.map((category, index) => {
              const ink = `var(--ch-${category.token})`;
              return (
                <DropdownMenu.Item key={category.slug} asChild>
                  <Link
                    to={`/category/${category.slug}`}
                    className="group relative flex items-start gap-3 rounded-2xl border border-transparent p-3 outline-none transition-colors hover:bg-[color-mix(in_oklch,var(--ink)_6%,transparent)] focus-visible:bg-[color-mix(in_oklch,var(--ink)_6%,transparent)]"
                  >
                    {/* The channel's signal as a lit chip carrying its number,
                         which is what makes the eight tiles tell themselves
                         apart at a glance. */}
                    <span
                      aria-hidden
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-xl font-mono text-[0.6rem] font-semibold tabular-nums text-[var(--void)] transition-transform duration-200 group-hover:scale-105"
                      style={{
                        background: ink,
                        boxShadow: `0 0 14px color-mix(in oklch, ${ink} 45%, transparent)`,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[0.88rem] font-bold leading-none">
                        {category.name}
                      </span>
                      <span className="mt-1.5 block line-clamp-2 text-[0.76rem] leading-snug text-[var(--ink-faint)]">
                        {category.tagline}
                      </span>
                    </span>

                    <ArrowUpRight
                      className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      style={{ color: ink }}
                      aria-hidden
                    />
                  </Link>
                </DropdownMenu.Item>
              );
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function AccountMenu({ user }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--edge-strong)] bg-[var(--paper-2)] font-mono text-[0.7rem] font-bold uppercase transition-[border-color,box-shadow] hover:border-[var(--n1)] hover:shadow-[0_0_20px_color-mix(in_oklch,var(--n1)_45%,transparent)]"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials(user.name)
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={12}
          align="end"
          className="z-[70] w-60 overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] shadow-[var(--lift-lg)]"
        >
          <div className="border-b border-[var(--rule)] bg-[var(--paper-2)] px-4 py-3">
            <p className="truncate font-display text-[0.9rem] font-bold leading-none">
              {user.name}
            </p>
            <p className="mt-1 truncate font-mono text-[0.62rem] text-[var(--ink-faint)]">
              {user.email}
            </p>
            {!user.emailVerified && (
              <Link
                to="/verify-email"
                className="mt-2 inline-block rounded-full bg-[var(--n3)] px-2.5 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-[var(--void)]"
              >
                Confirm email
              </Link>
            )}
          </div>

          <MenuLink
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
          />

          <MenuLink href="/bookmarks" icon={Bookmark} label="Saved" />
          <MenuLink href="/profile" icon={UserIcon} label="Profile" />
          <MenuLink href="/submit" icon={PenLine} label="Submit content" />
          {/* The control panel had no link anywhere in the app except a
               line in the sitemap — nine admin pages reachable only by typing
               the URL. It gets its own labelled group here so it reads as a
               separate place rather than one more account link. */}
          {user.role === "admin" && (
            <div className="border-t border-[var(--rule)] bg-[color-mix(in_oklch,var(--n1)_7%,transparent)]">
              <p className="px-4 pb-1 pt-2.5 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-[var(--n1)]">
                Admin
              </p>
              <MenuLink href="/admin" icon={Shield} label="Control panel" />
              <MenuLink
                href="/admin/submissions"
                icon={Inbox}
                label="Review queue"
              />
            </div>
          )}

          <form action={logout} className="border-t border-[var(--rule)]">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 font-mono text-[0.64rem] uppercase tracking-[0.13em] text-[var(--ink-soft)] transition-colors hover:bg-[var(--n1)] hover:text-[var(--void)]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function MenuLink({ href, icon: Icon, label }) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        to={href}
        className="flex items-center gap-2.5 border-b border-[var(--rule)] px-4 py-2.5 font-mono text-[0.64rem] uppercase tracking-[0.13em] outline-none transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--n2)] focus-visible:bg-[var(--paper-2)]"
      >
        <Icon className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
        {label}
      </Link>
    </DropdownMenu.Item>
  );
}

function MobileNav({ user, pathname }) {
  return (
    <div className="border-t border-[var(--rule)] bg-[var(--paper-2)] px-5 py-5 lg:hidden">
      <nav className="flex flex-col" aria-label="Mobile">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "border-b border-[var(--rule)] py-3 font-display text-[1.05rem] font-bold leading-none transition-colors",
              pathname.startsWith(link.href)
                ? "text-[var(--n1)]"
                : "hover:text-[var(--n2)]",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <p className="mark mt-6 mb-3 text-[var(--n2)]">Channels</p>
      <div className="grid grid-cols-2 gap-x-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            to={`/category/${category.slug}`}
            className="flex items-center gap-2.5 border-b border-[var(--rule)] py-2.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-[var(--ink-soft)]"
          >
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background: `var(--ch-${category.token})`,
                boxShadow: `0 0 8px var(--ch-${category.token})`,
              }}
            />

            {category.name}
          </Link>
        ))}
      </div>

      {!user && (
        <div className="mt-6 flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/register">Join</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
