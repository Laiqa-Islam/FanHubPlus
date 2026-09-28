import { useLoaderData } from "react-router";
import { CATEGORIES, EVENT_TYPES } from "@/lib/constants";
import { Misreg } from "@/components/press";
import { Meta } from "@/components/meta";
import { ResourceManager } from "@/components/admin/resource-manager";
import { VenueLookup } from "@/components/admin/venue-lookup";

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
    label: "Kind",
    kind: "select",
    required: true,
    half: true,
    options: EVENT_TYPES.map((t) => ({ value: t, label: t })),
  },
  { name: "venue", label: "Venue", half: true },
  { name: "city", label: "City", required: true, half: true },
  { name: "country", label: "Country", half: true },
  {
    name: "startsAt",
    label: "Starts",
    kind: "datetime",
    required: true,
    half: true,
  },
  {
    name: "lat",
    label: "Latitude",
    kind: "number",
    required: true,
    half: true,
    hint: "−90 to 90.",
  },
  {
    name: "lng",
    label: "Longitude",
    kind: "number",
    required: true,
    half: true,
    hint: "−180 to 180.",
  },
  {
    name: "story",
    label: "Highlight story",
    kind: "textarea",
    hint: "Narrative copy for the highlight reel. Only shown on highlighted events.",
  },
  { name: "ticketUrl", label: "Ticket link" },
  { name: "capacity", label: "Passes available (0 = no limit)" },
  { name: "description", label: "Description", kind: "textarea" },
];

export default function AdminEventsPage() {
  const { rows } = useLoaderData();

  return (
    <div>
      <Meta title="Events · Admin" />
      <div className="mb-8 border-t border-[var(--rule-strong)] pt-4">
        <p className="mark mb-3">Conventions, meetups, screenings</p>
        <Misreg
          as="h1"
          className="text-[clamp(1.7rem,4.2vw,2.6rem)]"
          ghostInk="var(--ch-tv)"
        >
          Events
        </Misreg>
      </div>

      <ResourceManager
        kind="event"
        rows={rows}
        fields={FIELDS}
        toolbar={<VenueLookup />}
        singular="event"
      />
    </div>
  );
}
