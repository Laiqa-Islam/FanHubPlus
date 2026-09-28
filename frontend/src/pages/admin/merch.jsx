import { useLoaderData } from "react-router";
import { CATEGORIES, MERCH_TAGS } from "@/lib/constants";
import { Misreg } from "@/components/press";
import { Meta } from "@/components/meta";
import { ResourceManager } from "@/components/admin/resource-manager";

const FIELDS = [
  { name: "name", label: "Name", required: true },
  {
    name: "category",
    label: "Channel",
    kind: "select",
    required: true,
    half: true,
    options: CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
  },
  {
    name: "price",
    label: "Price (USD)",
    kind: "number",
    required: true,
    half: true,
    hint: "Example: 29.99",
  },
  {
    name: "tag",
    label: "Tag",
    kind: "select",
    required: true,
    half: true,
    options: MERCH_TAGS.map((t) => ({ value: t, label: t })),
  },
  { name: "imageUrl", label: "Image URL" },
  { name: "description", label: "Description", kind: "textarea" },
  { name: "isUpcoming", label: "Upcoming release", kind: "checkbox" },
];

export default function AdminMerchPage() {
  const { rows } = useLoaderData();

  return (
    <div>
      <Meta title="Merch · Admin" />
      <div className="mb-8 border-t border-[var(--rule-strong)] pt-4">
        <p className="mark mb-3">Store catalogue</p>
        <Misreg
          as="h1"
          className="text-[clamp(1.7rem,4.2vw,2.6rem)]"
          ghostInk="var(--ch-movies)"
        >
          Merchandise
        </Misreg>
      </div>

      <ResourceManager
        kind="merchandise"
        rows={rows}
        fields={FIELDS}
        singular="item"
      />
    </div>
  );
}
