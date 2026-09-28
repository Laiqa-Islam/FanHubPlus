import { Link, useLoaderData } from "react-router";
import { Image } from "@/components/ui/image";
import {
  MailWarning,
  ShieldAlert,
  Sparkles,
  Bookmark,
  Compass,
  Activity,
  CalendarDays,
  ArrowUpRight,
  PlayCircle,
  PenLine,
  ShoppingBag,
  Settings,
  Shield,
  Inbox,
  Ticket,
} from "lucide-react";

import { CATEGORIES, categoryBySlug } from "@/lib/constants";
import { relativeTime } from "@/lib/utils";
import { Meta } from "@/components/meta";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { InkStrip, Misreg, RegMark, PressHeading } from "@/components/press";
import { ContentCard } from "@/components/content-card";
import { Duotone } from "@/components/duotone";
import { Button } from "@/components/ui/button";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Whole days since the account was opened, floored at one. */
function daysSince(iso) {
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return 1;
  return Math.max(1, Math.floor((Date.now() - start) / 86_400_000));
}

/**
 * The four places a signed-in member actually goes. These were reachable
 * only from the header before, which meant the page you land on after
 * signing in was the one page that never told you what you could do.
 */
const SHORTCUTS = [
  {
    href: "/explore",
    label: "Explore",
    body: "Search and filter the library",
    icon: Compass,
    ink: "var(--n2)",
  },
  {
    href: "/media",
    label: "Multimedia",
    body: "Watch and listen in place",
    icon: PlayCircle,
    ink: "var(--n1)",
  },
  {
    href: "/submit",
    label: "Submit",
    body: "Send a piece to the editors",
    icon: PenLine,
    ink: "var(--n3)",
  },
  {
    href: "/merch",
    label: "Shop",
    body: "Fan-picked merch and your cart",
    icon: ShoppingBag,
    ink: "var(--ch-kpop)",
  },
];

export default function DashboardPage() {
  const { user, params, activity, clippings, counts, picks, passes } =
    useLoaderData();

  const favorites = CATEGORIES.filter((c) =>
    user.favoriteCategories.includes(c.slug),
  );
  const firstName = user.name.split(" ")[0];

  // (The recommendations arrive already mapped onto the ContentCard shape.)

  const stats = [
    {
      label: "Saved",
      value: counts.all ?? 0,
      href: "/bookmarks",
      icon: Bookmark,
      ink: "var(--n2)",
    },
    {
      label: "Channels followed",
      value: favorites.length,
      href: "/profile",
      icon: Compass,
      ink: "var(--n1)",
    },
    {
      label: "Recent actions",
      value: activity.length,
      href: undefined,
      icon: Activity,
      ink: "var(--n3)",
    },
    {
      label: "Days a member",
      value: daysSince(user.createdAt),
      href: "/profile",
      icon: CalendarDays,
      ink: "var(--ch-gaming)",
    },
  ];

  return (
    <div>
      <Meta title="Your desk" />
      {/* Masthead — this issue is addressed to one reader. */}
      <header className="relative overflow-hidden border-b border-[var(--rule-strong)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            background:
              "radial-gradient(55% 60% at 12% 0%, var(--n1), transparent 70%), radial-gradient(45% 60% at 88% 20%, var(--n2), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-[88rem] px-5 pb-9 pt-8 sm:px-8">
          <div className="mb-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[var(--rule)] pb-3 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
            <RegMark className="text-[var(--ink)]" />
            <span>{new Date().toDateString()}</span>
            <span>
              {user.role === "admin" ? "Editor" : "Subscriber"} edition
            </span>
            <span className="ml-auto text-[var(--n1)]">Personal copy</span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
            <div className="flex items-center gap-5">
              {/* A lit disc rather than a plain avatar frame, so the one
                   portrait on the page belongs to the same family as the
                   character dossiers and the header mark. */}
              <span
                className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[var(--n1)] font-display text-[1.5rem] font-black leading-none text-[var(--n1)] sm:h-20 sm:w-20"
                style={{
                  boxShadow:
                    "0 0 26px color-mix(in oklch, var(--n1) 45%, transparent), inset 0 0 18px color-mix(in oklch, var(--n1) 22%, transparent)",
                }}
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  firstName.charAt(0).toUpperCase()
                )}
              </span>

              <div className="min-w-0">
                <p className="mark mb-2.5">{greeting()}</p>
                <Misreg
                  as="h1"
                  className="text-[clamp(1.9rem,5.5vw,3.5rem)]"
                  ghostInk="var(--n2)"
                >
                  {firstName}
                </Misreg>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/explore">Find something to read</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/profile">
                  <Settings className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <InkStrip height={5} />
      </header>

      <div className="mx-auto max-w-[88rem] px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-3">
          {params.denied === "admin" && (
            <Notice
              icon={ShieldAlert}
              title="Admin area is restricted"
              body="That section needs an administrator account."
            />
          )}
          {!user.emailVerified && (
            <Notice
              icon={MailWarning}
              title="Confirm your email"
              body="Saves, ratings and submissions unlock once your address is verified."
              action={{ href: "/verify-email", label: "Send a link" }}
            />
          )}
          {params.welcome === "1" && (
            <Notice
              icon={Sparkles}
              title={`Welcome in, ${firstName}`}
              body="Pick your channels so this page opens on what you actually read."
              action={{ href: "/profile", label: "Choose channels" }}
            />
          )}
        </div>

        {/* Admins land here after signing in, so this is where the control
             panel has to be announced. It was previously reachable only from
             a line in the sitemap. */}
        {user.role === "admin" && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--n1)_40%,transparent)] bg-[var(--paper-2)]">
            <div className="flex flex-wrap items-center gap-5 p-5">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[var(--void)]"
                style={{
                  background: "var(--n1)",
                  boxShadow:
                    "0 0 22px color-mix(in oklch, var(--n1) 45%, transparent)",
                }}
              >
                <Shield className="h-5 w-5" aria-hidden />
              </span>

              <div className="min-w-0 flex-1">
                <p className="mark !text-[0.56rem] text-[var(--n1)]">
                  Editor access
                </p>
                <p className="mt-1.5 font-display text-[1.05rem] font-bold leading-none">
                  You have the control panel
                </p>
                <p className="mt-2 text-[0.86rem] leading-snug text-[var(--ink-soft)]">
                  Usage statistics, and the editors for content, characters,
                  merch, events, the FAQ, submissions, feedback and users.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/admin">Open control panel</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/submissions">
                    <Inbox className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Review queue
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* The counts, in the same idiom the front page uses for the library
             totals — counted up on arrival rather than printed flat. */}
        <Reveal
          stagger={0.06}
          className="mt-8 grid grid-cols-2 gap-2.5 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatTile key={stat.label} {...stat} />
          ))}
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <PressHeading
              mark={favorites.length > 0 ? "Your channels" : "Most read"}
              title={
                favorites.length > 0
                  ? "Picked for you"
                  : "What everyone is reading"
              }
              ghostInk="var(--n2)"
              action={
                <Link
                  to="/explore"
                  className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
                >
                  See all
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              }
            />

            {picks.length === 0 ? (
              <Empty
                title="Nothing published yet"
                body="Once content is seeded or added from the admin panel, it appears here."
                action={{ href: "/explore", label: "Open the explorer" }}
              />
            ) : (
              // Two across, not three: this grid lives in the narrower of the
              // two page columns, and a third track squeezed the cards to
              // roughly 270px, where the titles started breaking mid-word.
              <Reveal stagger={0.05} className="grid gap-4 sm:grid-cols-2">
                {picks.map((item, index) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    index={index}
                    className="reveal"
                  />
                ))}
              </Reveal>
            )}

            <div className="mt-14">
              <PressHeading
                mark="Your file"
                title="Recent clippings"
                ghostInk="var(--n1)"
                action={
                  <Link
                    to="/bookmarks"
                    className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
                  >
                    Open file
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                }
              />

              {clippings.length === 0 ? (
                <Empty
                  title="Nothing saved yet"
                  body="Hit the save mark on anything worth keeping and it lands in your file."
                  action={{ href: "/explore", label: "Find something" }}
                />
              ) : (
                <Reveal stagger={0.05} className="grid gap-4 sm:grid-cols-2">
                  {clippings.map((row) => {
                    const ink = `var(--ch-${categoryBySlug(row.category)?.token ?? "anime"})`;
                    return (
                      <Link
                        key={row.bookmarkId}
                        to={row.href}
                        className="reveal group relative flex gap-4 overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-3 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--edge-strong)]"
                      >
                        <span className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[var(--paper-2)]">
                          {row.imageUrl && (
                            <Image
                              src={row.imageUrl}
                              alt=""
                              fill
                              sizes="72px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                          <Duotone ink={ink} strength={0.4} scrim={false} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="block font-mono text-[0.54rem] uppercase tracking-[0.16em]"
                            style={{ color: ink }}
                          >
                            {row.kindLabel}
                          </span>
                          <span className="mt-1.5 block line-clamp-2 font-display text-[0.92rem] font-bold leading-[1.18]">
                            {row.title}
                          </span>
                          {row.note ? (
                            <span className="mt-1.5 block line-clamp-1 text-[0.76rem] italic text-[var(--ink-faint)]">
                              {row.note}
                            </span>
                          ) : (
                            <span className="mt-1.5 block font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                              {relativeTime(row.savedAt)}
                            </span>
                          )}
                        </span>

                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{
                            border: `1px solid ${ink}`,
                            boxShadow: `0 0 26px color-mix(in oklch, ${ink} 26%, transparent)`,
                          }}
                        />
                      </Link>
                    );
                  })}
                </Reveal>
              )}
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-12">
            {/* A booking with a date on it is the most time-sensitive thing
                 on this page, so it leads the column. A pass you can only
                 find by navigating back to the event you booked it from is a
                 pass people lose. */}
            {passes.length > 0 && (
              <section>
                <SideHeading
                  title="Your passes"
                  href="/events"
                  linkLabel="All events"
                />

                <Reveal stagger={0.05} className="grid gap-2">
                  {passes.map((pass) => {
                    const passInk = `var(--ch-${categoryBySlug(pass.category)?.token ?? "anime"})`;
                    return (
                      <Link
                        key={pass.code}
                        to={`/tickets/${pass.code}`}
                        className="reveal group flex items-center gap-3 rounded-xl border p-2.5 transition-[transform,border-color] duration-300 hover:-translate-y-0.5"
                        style={{
                          borderColor: `color-mix(in oklch, ${passInk} 35%, transparent)`,
                          background: `color-mix(in oklch, ${passInk} 7%, transparent)`,
                        }}
                      >
                        <span
                          aria-hidden
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--void)]"
                          style={{ background: passInk }}
                        >
                          <Ticket className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[0.88rem] font-bold leading-none">
                            {pass.eventTitle}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                            {pass.status === "pending" && (
                              <span style={{ color: "var(--n3)" }}>
                                Awaiting approval ·
                              </span>
                            )}
                            {pass.startsAt
                              ? new Date(pass.startsAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    timeZone: "UTC",
                                  },
                                )
                              : ""}
                            {pass.city ? ` · ${pass.city}` : ""}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </Reveal>
              </section>
            )}

            <section>
              <SideHeading
                title="Your channels"
                href="/profile"
                linkLabel="Edit"
              />

              {favorites.length === 0 ? (
                <Empty
                  title="No channels yet"
                  body="Follow the fandoms you care about and this page reshapes around them."
                  action={{ href: "/profile", label: "Pick channels" }}
                />
              ) : (
                <Reveal stagger={0.05} className="grid gap-2">
                  {favorites.map((category, index) => {
                    const ink = `var(--ch-${category.token})`;
                    return (
                      <Link
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        className="reveal group flex items-center gap-3 rounded-xl border border-[var(--edge)] bg-[var(--paper-3)] p-2.5 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--edge-strong)]"
                      >
                        <span
                          aria-hidden
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-[0.58rem] font-bold tabular-nums text-[var(--void)] transition-transform duration-300 group-hover:scale-105"
                          style={{
                            background: ink,
                            boxShadow: `0 0 14px color-mix(in oklch, ${ink} 45%, transparent)`,
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[0.9rem] font-bold leading-none">
                            {category.name}
                          </span>
                          <span className="mt-1 block truncate text-[0.72rem] text-[var(--ink-faint)]">
                            {category.tagline}
                          </span>
                        </span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{ color: ink }}
                          aria-hidden
                        />
                      </Link>
                    );
                  })}
                </Reveal>
              )}
            </section>

            <section>
              <SideHeading title="Activity" />

              {activity.length === 0 ? (
                <p className="text-[0.9rem] text-[var(--ink-soft)]">
                  What you do here shows up in this column.
                </p>
              ) : (
                // A timeline rather than a ruled list: the vertical thread is
                // what makes a run of entries read as a sequence in time
                // instead of a table with the borders left on.
                // The thread sits outside the list: an `ol` may only contain
                // `li`, and a decorative span in there is invalid markup.
                <div className="relative">
                  <span
                    aria-hidden
                    className="absolute bottom-2 left-[3px] top-2 w-px"
                    style={{
                      background:
                        "linear-gradient(to bottom, var(--n1), color-mix(in oklch, var(--n2) 40%, transparent), transparent)",
                    }}
                  />

                  <ol className="flex flex-col gap-4 pl-5">
                    {activity.map((entry) => (
                      <li key={String(entry._id)} className="relative">
                        <span
                          aria-hidden
                          className="absolute -left-5 top-[0.4rem] h-[7px] w-[7px] rounded-full"
                          style={{
                            background: "var(--n1)",
                            boxShadow: "0 0 10px var(--n1)",
                          }}
                        />

                        <p className="text-[0.88rem] leading-snug text-[var(--ink-soft)]">
                          {entry.label || entry.action}
                        </p>
                        <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                          {relativeTime(entry.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          </aside>
        </div>

        {/* The close: where to go next. */}
        <section className="mt-16">
          <PressHeading
            mark="Jump to"
            title="Everything else"
            ghostInk="var(--n3)"
          />

          <Reveal
            stagger={0.06}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {(user.role === "admin"
              ? [
                  ...SHORTCUTS,
                  {
                    href: "/admin",
                    label: "Control panel",
                    body: "Statistics and every editor",
                    icon: Shield,
                    ink: "var(--n1)",
                  },
                ]
              : SHORTCUTS
            ).map((shortcut) => (
              <Link
                key={shortcut.href}
                to={shortcut.href}
                className="reveal group relative overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1"
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `color-mix(in oklch, ${shortcut.ink} 16%, transparent)`,
                    color: shortcut.ink,
                  }}
                >
                  <shortcut.icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-4 font-display text-[1rem] font-bold leading-none">
                  {shortcut.label}
                </p>
                <p className="mt-2 text-[0.84rem] leading-snug text-[var(--ink-soft)]">
                  {shortcut.body}
                </p>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    border: `1px solid ${shortcut.ink}`,
                    boxShadow: `0 0 26px color-mix(in oklch, ${shortcut.ink} 26%, transparent)`,
                  }}
                />
              </Link>
            ))}
          </Reveal>
        </section>
      </div>
    </div>
  );
}

/** A sidebar heading: the section headings are too heavy for a narrow column. */
function SideHeading({ title, href, linkLabel }) {
  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[1.15rem] font-black leading-none">
          {title}
        </h2>
        {href && linkLabel && (
          <Link
            to={href}
            className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--ink-faint)] transition-colors hover:text-[var(--n2)]"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      <div
        aria-hidden
        className="mt-3 h-px w-full"
        style={{
          background: "linear-gradient(90deg, var(--rule-strong), transparent)",
        }}
      />
    </div>
  );
}

function StatTile({ label, value, href, icon: Icon, ink }) {
  const inner = (
    <>
      <Icon className="h-4 w-4" style={{ color: ink }} aria-hidden />
      <p
        className="mt-3.5 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-black leading-none"
        style={{
          textShadow: `0 0 24px color-mix(in oklch, ${ink} 32%, transparent)`,
          color: ink,
        }}
      >
        <CountUp to={value} />
      </p>
      <p className="mark mt-1.5 !text-[0.56rem] text-[var(--ink-faint)]">
        {label}
      </p>
    </>
  );

  const className =
    "reveal relative overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-4 transition-[transform,border-color] duration-300";

  return href ? (
    <Link
      to={href}
      className={`${className} group hover:-translate-y-1 hover:border-[var(--edge-strong)]`}
    >
      {inner}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          border: `1px solid ${ink}`,
          boxShadow: `0 0 24px color-mix(in oklch, ${ink} 24%, transparent)`,
        }}
      />
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function Empty({ title, body, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--edge-strong)] bg-[var(--paper-2)] p-8 text-center">
      <p className="font-display text-[1rem] font-bold leading-none">{title}</p>
      <p className="mx-auto mt-3 max-w-xs text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
        {body}
      </p>
      {action && (
        <Button asChild size="sm" variant="outline" className="mt-5">
          <Link to={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

function Notice({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] p-4">
      <Icon className="h-5 w-5 shrink-0 text-[var(--n3)]" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[0.95rem] font-bold leading-none">
          {title}
        </p>
        <p className="mt-1.5 text-[0.88rem] text-[var(--ink-soft)]">{body}</p>
      </div>
      {action && (
        <Button asChild size="sm" variant="outline">
          <Link to={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
