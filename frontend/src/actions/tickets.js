// Client stubs for the backend's `tickets` actions (POST /api/actions/tickets/<name>).
import { callAction } from "@/lib/api";

export const getTicketAvailability = (...args) => callAction("tickets", "getTicketAvailability", args);
export const getMyTicket = (...args) => callAction("tickets", "getMyTicket", args);
export const applyForTicket = (...args) => callAction("tickets", "applyForTicket", args);
export const releaseTicket = (...args) => callAction("tickets", "releaseTicket", args);
export const decideTicket = (...args) => callAction("tickets", "decideTicket", args);
