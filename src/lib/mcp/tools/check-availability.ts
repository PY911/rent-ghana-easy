import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "check_rental_availability",
  title: "Check rental availability",
  description: "Check which dates are fully booked for a rental listing.",
  inputSchema: {
    listingId: z.string().uuid().describe("The rental listing ID returned by search_rentals."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ listingId }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Sign in to Yɛɛ Kɔ to check availability.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.rpc("get_unavailable_listing_dates", {
      p_listing_id: listingId,
    });
    if (error) throw new ToolError("Availability could not be checked.");
    const unavailableDates = (data ?? []).map((row) => row.unavailable_date);
    return {
      content: [{ type: "text", text: unavailableDates.length ? `${unavailableDates.length} dates are fully booked.` : "No fully booked dates were found." }],
      structuredContent: { listingId, unavailableDates },
    };
  },
});