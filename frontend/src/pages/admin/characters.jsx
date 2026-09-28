import { useLoaderData } from "react-router";
import { CATEGORIES } from "@/lib/constants";
import { Misreg } from "@/components/press";
import { Meta } from "@/components/meta";
import { ResourceManager } from "@/components/admin/resource-manager";

const FIELDS = [
  { name: "name", label: "Name", required: true, half: true },
  {
    name: "category",
    label: "Channel",
    kind: "select",
    required: true,
    half: true,
    options: CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
  },
  { name: "franchise", label: "Franchise", half: true },
  { name: "imageUrl", label: "Image URL", half: true },
  { name: "kanji", label: "Name in original script", half: true },
  { name: "role", label: "Role", hint: "e.g. Sorcerer · Mentor", half: true },
  { name: "grade", label: "Grade", hint: "e.g. Special Grade", half: true },
  {
    name: "sealMark",
    label: "Seal glyph",
    hint: "One or two characters.",
    half: true,
  },
  {
    name: "accent",
    label: "Accent colour",
    hint: "Hex. Floods this character's page; blank falls back to the channel.",
    half: true,
  },
  { name: "affiliation", label: "Affiliation", half: true },
  { name: "status", label: "Status", half: true },
  { name: "troops", label: "Troops", half: true },
  { name: "relationships", label: "Relationships", hint: "Comma separated." },
  { name: "skills", label: "Skills", hint: "Comma separated." },
  { name: "weapons", label: "Weapons & EQS", hint: "Comma separated." },
  { name: "traits", label: "Traits", hint: "Comma separated." },
  { name: "bio", label: "Biography", kind: "textarea" },
];

export default function AdminCharactersPage() {
  const { rows } = useLoaderData();

  return (
    <div>
      <Meta title="Characters · Admin" />
      <div className="mb-8 border-t border-[var(--rule-strong)] pt-4">
        <p className="mark mb-3">Profile cards</p>
        <Misreg
          as="h1"
          className="text-[clamp(1.7rem,4.2vw,2.6rem)]"
          ghostInk="var(--ch-kpop)"
        >
          Characters
        </Misreg>
      </div>

      <ResourceManager
        kind="character"
        rows={rows}
        fields={FIELDS}
        singular="character"
      />
    </div>
  );
}
