import { auth, defineMcp } from "@lovable.dev/mcp-js";
import cancelBookingTool from "./tools/cancel-booking";
import checkAvailabilityTool from "./tools/check-availability";
import listMyBookingsTool from "./tools/list-my-bookings";
import searchRentalsTool from "./tools/search-rentals";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "rent-ghana-now",
  title: "Rent Ghana Now",
  version: "0.1.0",
  instructions: "Search Yɛɛ Kɔ rentals, check booked dates, and help the signed-in renter manage their own booking requests. Never infer availability beyond the returned booked dates, and never expose vendor contact details or internal pricing.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchRentalsTool, checkAvailabilityTool, listMyBookingsTool, cancelBookingTool],
});