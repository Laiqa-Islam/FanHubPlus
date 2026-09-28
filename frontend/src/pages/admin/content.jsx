import { useLoaderData } from "react-router";
import { CATEGORIES, CONTENT_TYPES } from "@/lib/constants";
import { Misreg } from "@/components/press";
import { Meta } from "@/components/meta";
import { ResourceManager } from "@/components/admin/resource-manager";

const FIELDS = [
  { name: "title", label: "Title", required: true },
  {
    name: "category",
    label: "Channel",
    kind: "select",
    required: true,
    half: true,
    options: CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
  },
  {
    name: "type",
    label: "Format",
    kind: "select",
    required: true,
    half: true,
    options: CONTENT_TYPES.map((t) => ({ value: t, label: t })),
  },
  { name: "summary", label: "Summary", kind: "textarea" },
  {
    name: "body",
    label: "Body",
    kind: "textarea",
    hint: "Plain paragraphs separated by a blank line, or HTML if you prefer.",
  },
  { name: "coverImage", label: "Cover image URL", half: true },
  { name: "mediaUrl", label: "Media URL (video/audio)", half: true },
  { name: "genre", label: "Genres", half: true, hint: "Comma separated." },
  {
    name: "mediaTags",
    label: "Media tags",
    half: true,
    hint: "Comma separated, e.g. Trailer, Breakdown.",
  },
  {
    name: "embedUrl",
    label: "Embed link",
    hint: "YouTube, Vimeo, Spotify or SoundCloud. Takes precedence over Media URL.",
  },
  {
    name: "transcript",
    label: "Transcript",
    kind: "textarea",
    hint: "Plain text, shown under the player. Makes spoken content searchable.",
  },
  {
    name: "timeline",
    label: "Timeline",
    kind: "textarea",
    hint: "One milestone per line: label | title | body. Leave empty for none.",
  },
  {
    name: "status",
    label: "Status",
    kind: "select",
    required: true,
    half: true,
    options: [
      { value: "published", label: "Published" },
      { value: "draft", label: "Draft" },
    ],
  },
];

export default function AdminContentPage() {
  const { rows } = useLoaderData();

  return (
    <div>
      <Meta title="Content · Admin" />
      <div className="mb-8 border-t border-[var(--rule-strong)] pt-4">
        <p className="mark mb-3">Articles, video, audio and galleries</p>
        <Misreg
          as="h1"
          className="text-[clamp(1.7rem,4.2vw,2.6rem)]"
          ghostInk="var(--ch-anime)"
        >
          Content
        </Misreg>
      </div>

      <ResourceManager
        kind="content"
        rows={rows}
        fields={FIELDS}
        singular="piece"
      />
    </div>
  );
}
