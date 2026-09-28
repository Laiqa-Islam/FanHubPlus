import { Bug, Lightbulb, HelpCircle } from "lucide-react";

import { useLoaderData } from "react-router";

import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { InkStrip, Misreg } from "@/components/press";
import { FeedbackForm } from "@/components/feedback/feedback-form";

const DESCRIPTION =
  "Report a bug, suggest a feature, or ask a question about Fan Hub Plus.";

const KINDS = [
  { icon: Bug, title: "Bug", body: "Something is broken or behaving oddly." },
  {
    icon: Lightbulb,
    title: "Suggestion",
    body: "An idea for something that should exist.",
  },
  {
    icon: HelpCircle,
    title: "Query",
    body: "A question about the site or its content.",
  },
];

export default function FeedbackPage() {
  const { signedIn } = useLoaderData();

  return (
    <div>
      <Meta title="Send feedback" description={DESCRIPTION} />
      <header className="border-b border-[var(--rule-strong)]">
        <div className="mx-auto max-w-3xl px-5 pb-8 pt-8">
          <Breadcrumbs trail={[{ label: "Feedback" }]} />
          <p className="mark mb-3">Letters page</p>
          <Misreg
            as="h1"
            className="text-[clamp(1.85rem,5vw,3.2rem)]"
            ghostInk="var(--ch-comics)"
          >
            Write in
          </Misreg>
          <p className="mt-5 max-w-lg border-l-2 border-[var(--ch-comics)] pl-5 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
            Found a bug, got an idea, or just want to ask something? Everything
            sent here is read by an administrator.
          </p>
        </div>
        <InkStrip height={5} />
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-10 grid gap-2.5 sm:grid-cols-3">
          {KINDS.map((kind) => (
            <div
              key={kind.title}
              className="rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-4"
            >
              <kind.icon className="h-4 w-4 text-[var(--spot)]" aria-hidden />
              <p className="mt-3 font-display text-[0.95rem] leading-none">
                {kind.title}
              </p>
              <p className="mt-1.5 text-[0.85rem] leading-snug text-[var(--ink-soft)]">
                {kind.body}
              </p>
            </div>
          ))}
        </div>

        <FeedbackForm signedIn={signedIn} />
      </div>
    </div>
  );
}
