import { Link, useLoaderData } from "react-router";
import { Inbox } from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Meta } from "@/components/meta";
import { ReviewCard } from "@/components/admin/review-card";
import { relativeTime } from "@/lib/utils";

export default function AdminSubmissionsPage() {
  const { pending, recent } = useLoaderData();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Meta title="Review submissions" />
      <Breadcrumbs trail={[{ label: "Admin" }, { label: "Submissions" }]} />

      <header className="mb-10">
        <p className="mark mb-3">Moderation queue</p>
        <h1 className="font-display text-[clamp(1.65rem,4.2vw,2.3rem)]">
          Fan submissions
        </h1>
        <p className="mt-4 text-[1rem] leading-relaxed text-[var(--ink-soft)]">
          Approving publishes the piece to its channel immediately. Rejecting
          keeps it private and records your note for the author.
        </p>
      </header>

      {pending.length === 0 ? (
        <div className="border border-dashed border-[var(--edge-strong)] px-6 py-16 text-center">
          <Inbox
            className="mx-auto h-8 w-8 text-[var(--ink-faint)]"
            aria-hidden
          />

          <p className="mt-4 font-semibold">Queue is clear</p>
          <p className="mx-auto mt-2 max-w-sm text-[0.9rem] text-[var(--ink-soft)]">
            Nothing is waiting for review right now.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {pending.map((submission) => {
            const author = submission.userId;

            // Submissions predating v2 Phase 10 kept a single cover image in
            // `mediaUrl`; present it as a one-image set so one card renders both.
            const media = (submission.media ?? []).length
              ? (submission.media ?? []).map((asset) => ({
                  url: asset.url,
                  kind: String(asset.kind),
                  caption: asset.caption ?? "",
                }))
              : submission.mediaUrl
                ? [{ url: submission.mediaUrl, kind: "image", caption: "" }]
                : [];

            return (
              <ReviewCard
                key={String(submission._id)}
                id={String(submission._id)}
                title={submission.title}
                category={
                  categoryBySlug(submission.category)?.name ??
                  submission.category
                }
                categoryToken={
                  categoryBySlug(submission.category)?.token ?? "anime"
                }
                authorName={author?.name ?? "Unknown member"}
                authorEmail={author?.email ?? ""}
                submittedAt={relativeTime(submission.createdAt)}
                body={submission.body}
                format={submission.format ?? "article"}
                media={media}
                embedProvider={submission.embedProvider ?? ""}
                embedId={submission.embedId ?? ""}
                transcript={submission.transcript ?? ""}
                ownWorkDeclared={Boolean(submission.ownWorkDeclared)}
              />
            );
          })}
        </div>
      )}

      {recent.length > 0 && (
        <section className="mt-16 border-t border-[var(--rule)] pt-10">
          <h2 className="mb-5 font-display text-[1.3rem]">Recently reviewed</h2>
          <ul className="flex flex-col gap-2">
            {recent.map((submission) => (
              <li
                key={String(submission._id)}
                className="flex flex-wrap items-center gap-3 border border-[var(--rule-strong)] px-4 py-3 text-[0.88rem]"
              >
                <span className="min-w-0 flex-1 truncate">
                  {submission.title}
                </span>
                <span
                  className={
                    submission.status === "approved"
                      ? "font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[var(--spot-2)]"
                      : "font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[var(--spot)]"
                  }
                >
                  {submission.status}
                </span>
                {submission.publishedContentId && (
                  <Link
                    to="/explore?genre=Fan%20submission"
                    className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] hover:text-[var(--spot)]"
                  >
                    View
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
