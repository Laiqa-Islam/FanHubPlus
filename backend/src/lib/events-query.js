import { connectToDatabase } from "./db.js";
import { Event } from "../models/index.js";
import { categoryBySlug } from "./constants.js";

/** Event data shaped for the map and calendar (SRS FR-10). */

/**
 * Channel inks as literal hex rather than `var(--ch-…)`, because Leaflet pins
 * are built as raw HTML strings outside the React tree, where a custom
 * property defined on `:root` still resolves — but the dark-mode value would
 * not track. Fixed hex keeps pins legible on the map's own light tiles in
 * both themes.
 */
const PIN_INK = {
  anime: "#ff48a0",
  gaming: "#00a95c",
  movies: "#ff6c2f",
  tv: "#0078bf",
  kpop: "#765ba7",
  comics: "#ff4c65",
  manga: "#00838a",
  cosplay: "#d18700",
};

export async function getEvents(options = {}) {
  await connectToDatabase();

  const filter = {};
  if (options.category) filter.category = options.category;
  if (options.city) filter.city = options.city;

  const docs = await Event.find(filter).sort({ startsAt: 1 }).lean();

  return docs.map((doc) => {
    const category = categoryBySlug(doc.category);
    const coordinates = doc.location?.coordinates ?? [0, 0];
    return {
      id: String(doc._id),
      slug: doc.slug,
      title: doc.title,
      category: doc.category,
      categoryName: category?.name ?? doc.category,
      ink: PIN_INK[category?.token ?? "anime"] ?? "#ff2e88",
      type: doc.type,
      description: doc.description ?? "",
      story: doc.story ?? "",
      venue: doc.venue ?? "",
      city: doc.city,
      country: doc.country ?? "",
      // Stored as GeoJSON [longitude, latitude].
      lng: coordinates[0] ?? 0,
      lat: coordinates[1] ?? 0,
      startsAt: doc.startsAt.toISOString(),
      endsAt: doc.endsAt ? new Date(doc.endsAt).toISOString() : null,
      ticketUrl: doc.ticketUrl ?? "",
      capacity: Number(doc.capacity ?? 0),
      imageUrl: doc.imageUrl ?? "",
      isHighlight: Boolean(doc.isHighlight),
    };
  });
}

export async function getEventCities() {
  await connectToDatabase();
  const cities = await Event.distinct("city");
  return cities.filter(Boolean).sort();
}
