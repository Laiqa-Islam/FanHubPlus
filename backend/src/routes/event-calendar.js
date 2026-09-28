import { connectToDatabase } from "../lib/db.js";
import { Event } from "../models/index.js";

/**
 * The event as an `.ics` file.
 *
 * Hand-built rather than pulled from a library: iCalendar for a single
 * all-day-or-timed VEVENT is a dozen lines, and the only parts that are easy
 * to get wrong — CRLF line endings, escaping, and folding long lines — are
 * handled below.
 */

/** iCalendar timestamps are basic-format UTC: 20260410T183000Z. */
function stamp(date) {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/** RFC 5545 §3.3.11: backslash, semicolon, comma and newline are special. */
function escape(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Lines must be at most 75 octets, continued with CRLF + one space. Calendar
 * clients are strict about this and a long description is the usual way to
 * trip it.
 */
function fold(line) {
  if (line.length <= 73) return line;
  const parts = [];
  let rest = line;
  parts.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length > 72) {
    parts.push(` ${rest.slice(0, 72)}`);
    rest = rest.slice(72);
  }
  if (rest.length) parts.push(` ${rest}`);
  return parts.join("\r\n");
}

export async function GET(_request, { params }) {
  const { slug } = await params;

  await connectToDatabase();
  const event = await Event.findOne({ slug }).lean();
  if (!event) return new Response("Not found", { status: 404 });

  const start = new Date(event.startsAt);
  // No end date on the record: assume a three-hour slot rather than emitting
  // a zero-length event, which some clients render as a bare reminder.
  const end = event.endsAt
    ? new Date(event.endsAt)
    : new Date(start.getTime() + 3 * 60 * 60 * 1000);

  const location = [event.venue, event.city, event.country]
    .filter(Boolean)
    .join(", ");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fan Hub Plus//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${slug}@fanhub.plus`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    fold(`SUMMARY:${escape(String(event.title))}`),
    fold(`DESCRIPTION:${escape(String(event.description ?? ""))}`),
    fold(`LOCATION:${escape(location)}`),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
