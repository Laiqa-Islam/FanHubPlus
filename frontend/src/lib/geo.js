/**
 * Distance helpers for location-aware event discovery (SRS FR-10).
 *
 * Distances are computed client-side from the browser's coordinates. The
 * alternative — sending the member's position to the server for a `$near`
 * query — would mean storing or logging their location, which this feature
 * does not need. Sixteen events sort instantly in the browser.
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in kilometres. */
export function distanceKm(from, to) {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Human-readable distance — metres under a kilometre, then rounded km. */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

/**
 * Wraps the Geolocation API in a promise with a plain-language error.
 * Browsers expose the raw PositionError codes, which mean nothing to a reader.
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("This browser doesn't support location services."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => {
        const messages = {
          1: "Location permission was denied. You can still filter events by city.",
          2: "Your location is unavailable right now. Try again, or filter by city.",
          3: "Finding your location took too long. Try again, or filter by city.",
        };
        reject(
          new Error(
            messages[error.code] ?? "We couldn't determine your location.",
          ),
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  });
}
