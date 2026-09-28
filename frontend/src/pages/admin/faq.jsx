import { useLoaderData } from "react-router";
import { Misreg } from "@/components/press";
import { Meta } from "@/components/meta";
import { ResourceManager } from "@/components/admin/resource-manager";

const FIELDS = [
  { name: "question", label: "Question", required: true },
  { name: "answer", label: "Answer", kind: "textarea", required: true },
  { name: "tags", label: "Tags", half: true, hint: "Comma separated." },
  { name: "isPublished", label: "Published", kind: "checkbox", half: true },
];

export default function AdminFaqPage() {
  const { rows } = useLoaderData();

  return (
    <div>
      <Meta title="FAQ · Admin" />
      <div className="mb-8 border-t border-[var(--rule-strong)] pt-4">
        <p className="mark mb-3">Assistant knowledge base</p>
        <Misreg
          as="h1"
          className="text-[clamp(1.7rem,4.2vw,2.6rem)]"
          ghostInk="var(--ch-gaming)"
        >
          FAQ
        </Misreg>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
          These entries back the optional AI assistant (Phase 9) and are already
          used to answer common questions about the platform.
        </p>
      </div>

      <ResourceManager
        kind="faq"
        rows={rows}
        fields={FIELDS}
        singular="entry"
      />
    </div>
  );
}
