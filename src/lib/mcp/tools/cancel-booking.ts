import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "cancel_pending_booking",
  title: "Cancel pending booking",
  description: "Cancel one pending rental request belonging to the signed-in user.",
  inputSchema: {
    bookingId: z.string().uuid().describe("The booking ID returned by list_my_bookings."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ bookingId }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Sign in to Yɛɛ Kɔ to cancel a booking.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .eq("renter_id", ctx.getUserId())
      .eq("status", "pending")
      .select("id,reference,status")
      .maybeSingle();
    if (error) throw new ToolError("The booking could not be cancelled.");
    if (!data) throw new ToolError("Only your own pending booking requests can be cancelled.");
    const booking = { id: data.id, reference: data.reference, status: data.status };
    return {
      content: [{ type: "text", text: `Booking ${data.reference ?? data.id} was cancelled.` }],
      structuredContent: { booking },
    };
  },
});