import { useEffect, useRef } from "react";

/**
 * OpenStreetMap view of the event calendar (SRS FR-10).
 *
 * Leaflet is loaded dynamically inside an effect rather than imported at the
 * top of the module: it touches `window` on import, so a static import would
 * break server rendering. That also keeps ~40KB off the initial bundle for
 * readers who never open the map.
 *
 * Tiles come straight from OpenStreetMap, which requires visible attribution —
 * Leaflet's attribution control provides it and must not be removed.
 */
export function EventMap({ events, origin, activeSlug, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const markerBySlug = useRef(new Map());
  // Keep the latest callback without re-running the setup effect.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Create the map once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [51.5072, -0.1276],
        zoom: 4,
        scrollWheelZoom: false, // don't hijack the page scroll
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
      markerBySlug.current.clear();
    };
  }, []);

  // Redraw markers whenever the filtered event list changes.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      const map = mapRef.current;
      const layer = markersRef.current;
      if (cancelled || !map || !layer) return;

      layer.clearLayers();
      markerBySlug.current.clear();

      const points = [];

      for (const event of events) {
        if (!event.lat && !event.lng) continue;

        // Channel-ink pin drawn as markup, so it matches the press palette
        // instead of shipping Leaflet's default blue PNG.
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:block;width:18px;height:18px;background:${event.ink};border:2px solid #17161c;box-shadow:2px 2px 0 rgba(0,0,0,.35)"></span>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const marker = L.marker([event.lat, event.lng], {
          icon,
          title: event.title,
        })
          .bindPopup(
            `<strong style="font-size:13px">${escapeHtml(event.title)}</strong><br>` +
              `<span style="font-size:12px">${escapeHtml(event.venue)}, ${escapeHtml(event.city)}</span>`,
          )
          .on("click", () => onSelectRef.current(event.slug));

        marker.addTo(layer);
        markerBySlug.current.set(event.slug, marker);
        points.push([event.lat, event.lng]);
      }

      if (origin) points.push([origin.lat, origin.lng]);

      if (points.length > 0) {
        map.fitBounds(L.latLngBounds(points).pad(0.2), { maxZoom: 11 });
      }

      // Mark the reader's own position distinctly.
      if (origin) {
        L.circleMarker([origin.lat, origin.lng], {
          radius: 8,
          color: "#17161c",
          weight: 2,
          fillColor: "#ff2e88",
          fillOpacity: 1,
        })
          .bindPopup("You are here")
          .addTo(layer);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [events, origin]);

  // Open the popup for whichever event the list has selected.
  useEffect(() => {
    if (!activeSlug) return;
    const marker = markerBySlug.current.get(activeSlug);
    if (!marker) return;
    marker.openPopup();
    mapRef.current?.panTo(marker.getLatLng());
  }, [activeSlug]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Map of upcoming events"
      className="h-[26rem] w-full rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] lg:h-[34rem]"
    />
  );
}

/** Popup content is built as an HTML string, so event data must be escaped. */
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
