import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_bookings",
  title: "List my bookings",
  description: "List rental requests and bookings belonging to the signed-in user.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum bookings to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Sign in to Yɛɛ Kɔ to view bookings.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("bookings")
      .select("id,reference,listing_id,start_date,end_date,quantity,status,payment_status,total,deposit_amount,balance_amount,balance_due_date,created_at")
      .eq("renter_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new ToolError("Your bookings could not be loaded.");
    const bookings = (data ?? []).map((booking) => ({
      id: booking.id,
      reference: booking.reference,
      listingId: booking.listing_id,
      startDate: booking.start_date,
      endDate: booking.end_date,
      quantity: booking.quantity,
      status: booking.status,
      paymentStatus: booking.payment_status,
      totalGhs: booking.total,
      depositGhs: booking.deposit_amount,
      balanceGhs: booking.balance_amount,
      balanceDueDate: booking.balance_due_date,
      createdAt: booking.created_at,
    }));
    return {
      content: [{ type: "text", text: bookings.length ? `Found ${bookings.length} bookings.` : "You have no bookings yet." }],
      structuredContent: { bookings },
    };
  },
});