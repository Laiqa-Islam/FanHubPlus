import { Link, useLoaderData } from "react-router";
import { Inbox, MessageSquare, Eye, Star } from "lucide-react";

import { Misreg } from "@/components/press";
import { Meta } from "@/components/meta";
import { relativeTime } from "@/lib/utils";

export default function AdminOverviewPage() {
  const { stats } = useLoaderData();
  const maxViews = Math.max(1, ...stats.categories.map((c) => c.views));

  return (
    <div>
      <Meta title="Control panel" />
      <div className="mb-8 border-t border-[var(--rule-strong)] pt-4">
        <p className="mark mb-3">Usage statistics</p>
        <Misreg
          as="h1"
          className="text-[clamp(1.75rem,4.5vw,2.8rem)]"
          ghostInk="var(--spot-2)"
        >
          Overview
        </Misreg>
      </div>

      {/* Anything waiting on a human */}
      {(stats.pending.submissions > 0 || stats.pending.feedback > 0) && (
        <div className="mb-8 flex flex-wrap gap-3">
          {stats.pending.submissions > 0 && (
            <Link
              to="/admin/submissions"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--edge)] bg-[var(--spot)] px-4 py-2.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[var(--void)] transition-[transform,box-shadow] hover:-translate-y-[2px] hover:shadow-[var(--lift-md)]"
            >
              <Inbox className="h-3.5 w-3.5" aria-hidden />
              {stats.pending.submissions} submission
              {stats.pending.submissions === 1 ? "" : "s"} awaiting review
            </Link>
          )}
          {stats.pending.feedback > 0 && (
            <Link
              to="/admin/feedback"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--edge)] bg-[var(--flag)] px-4 py-2.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[var(--void)] transition-[transform,box-shadow] hover:-translate-y-[2px] hover:shadow-[var(--lift-md)]"
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              {stats.pending.feedback} open report
              {stats.pending.feedback === 1 ? "" : "s"}
            </Link>
          )}
        </div>
      )}

      {/* Headline counters */}
      <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Members" value={stats.totals.users} />
        <Stat
          label="Active · 30 days"
          value={stats.activeUsers.last30}
          hint={`${stats.activeUsers.last7} in the last 7`}
        />

        <Stat label="Published pieces" value={stats.totals.content} />
        <Stat label="Items saved" value={stats.totals.bookmarks} />
        <Stat label="Characters" value={stats.totals.characters} />
        <Stat label="Showcase items" value={stats.totals.merch} />
        <Stat label="Events" value={stats.totals.events} />
        <Stat
          label="Chatbot messages"
          value={stats.chatbot.totalMessages}
          hint={`${stats.chatbot.last30} in the last 30 days`}
        />
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Popular categories — a bar chart drawn with rules, not a library */}
        <section>
          <h2 className="mb-5 border-t border-[var(--rule-strong)] pt-3 font-display text-[1.30rem] leading-none">
            Popular channels
          </h2>
          <ul className="flex flex-col gap-3">
            {stats.categories.map((category) => (
              <li key={category.slug}>
                <div className="mb-1 flex items-baseline justify-between gap-3 font-mono text-[0.66rem] uppercase tracking-[0.12em]">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: `var(--ch-${category.token})`,
                        boxShadow: `0 0 9px var(--ch-${category.token})`,
                      }}
                    />

                    {category.name}
                  </span>
                  <span className="tabular-nums text-[var(--ink-faint)]">
                    {category.views.toLocaleString()} views · {category.count}{" "}
                    pieces
                  </span>
                </div>
                <div className="h-3 w-full border border-[var(--edge)] bg-[var(--paper-2)]">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.max(2, (category.views / maxViews) * 100)}%`,
                      background: `var(--ch-${category.token})`,
                    }}
                    role="presentation"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-10">
          {/* Most-read */}
          <section>
            <h2 className="mb-4 border-t border-[var(--rule-strong)] pt-3 font-display text-[1.30rem] leading-none">
              Most read
            </h2>
            <ol className="flex flex-col">
              {stats.topContent.map((item, index) => (
                <li key={item.slug}>
                  <Link
                    to={`/content/${item.slug}`}
                    className="flex items-baseline gap-3 border-b border-[var(--rule)] py-2 transition-colors hover:bg-[var(--paper-2)]"
                  >
                    <span className="font-mono text-[0.62rem] tabular-nums text-[var(--ink-faint)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.9rem]">
                      {item.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-2.5 font-mono text-[0.62rem] tabular-nums text-[var(--ink-faint)]">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" aria-hidden />
                        {item.views.toLocaleString()}
                      </span>
                      {item.rating > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3" aria-hidden />
                          {item.rating.toFixed(1)}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* Recent activity across all members */}
          <section>
            <h2 className="mb-4 border-t border-[var(--rule-strong)] pt-3 font-display text-[1.30rem] leading-none">
              Latest activity
            </h2>
            <ol className="flex flex-col">
              {stats.recentActivity.map((entry, index) => (
                <li
                  key={`${entry.at}-${index}`}
                  className="flex items-baseline gap-3 border-b border-[var(--rule)] py-2"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 bg-[var(--spot)]"
                  />

                  <span className="min-w-0 flex-1 text-[0.88rem]">
                    {entry.label}
                  </span>
                  <span className="shrink-0 font-mono text-[0.6rem] uppercase text-[var(--ink-faint)]">
                    {relativeTime(entry.at)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-5">
      <p className="font-display text-[2.6rem] leading-none tabular-nums">
        {value.toLocaleString()}
      </p>
      <p className="mark mt-1.5 !text-[0.58rem]">{label}</p>
      {hint && (
        <p className="mt-1 font-mono text-[0.6rem] text-[var(--ink-faint)]">
          {hint}
        </p>
      )}
    </div>
  );
}
