import mongoose from "mongoose";

const globalForMongoose = globalThis;

const cached = globalForMongoose._mongoose ?? {
  conn: null,
  promise: null,
};
globalForMongoose._mongoose = cached;

/**
 * Mongoose readyState 1 is "connected"; 2 is "connecting", which is fine to
 * wait on. Anything else means the socket is gone.
 */
function isUsable(conn) {
  return (
    conn !== null &&
    (conn.connection.readyState === 1 || conn.connection.readyState === 2)
  );
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Configure it in the backend environment.");
  }
  // A cached connection is only worth reusing while it is actually open.
  // Caching `conn` alone was a real trap: if the network dropped the socket
  // mid-session — a blocked port, a laptop sleeping, a hotspot changing — the
  // handle stayed truthy forever, and because `bufferCommands` is off every
  // later query failed instantly with no attempt to reconnect. Sign-in was
  // the loudest symptom, since it cannot fall back to cached data.
  if (isUsable(cached.conn)) return cached.conn;

  if (cached.conn) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      // Fail fast instead of hanging a request for 30s when Atlas is
      // unreachable (wrong IP allowlist is the usual culprit).
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the rejected promise so the next request retries instead of
    // replaying the same failure forever.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
