import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookingWithListing, ListingWithRelations } from "@/lib/marketplace";

export type BookingRequestInput = {
  listing: ListingWithRelations;
  startDate: string;
  endDate: string;
  quantity: number;
  contactName: string;
  contactPhone: string;
  deliveryAddress: string;
  notes: string;
};

export async function createBookingRequest(input: BookingRequestInput) {
  const { data, error } = await supabase
    .rpc("request_booking", {
      p_listing_id: input.listing.id,
      p_start_date: input.startDate,
      p_end_date: input.endDate,
      p_quantity: input.quantity,
      p_contact_name: input.contactName,
      p_contact_phone: input.contactPhone,
      p_delivery_address: input.deliveryAddress,
      p_notes: input.notes || undefined,
    });

  if (error) throw error;
  if (!data?.[0]) throw new Error("Could not create booking request");
  return data[0];
}

export async function cancelBooking(bookingId: string) {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);
  if (error) throw error;
}

const BOOKING_SELECT =
  "*, listing:listings(id,title,slug,images,price,price_unit), vendor:vendors(id,name,slug,phone,whatsapp)";

export const adminBookingsQuery = queryOptions({
  queryKey: ["admin", "bookings"],
  queryFn: async (): Promise<BookingWithListing[]> => {
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as unknown as BookingWithListing[];
  },
});

export async function updateBookingStatus(
  bookingId: string,
  patch: {
    status?: string;
    payment_status?: string;
    deposit_paid_at?: string | null;
    balance_paid_at?: string | null;
    admin_notes?: string | null;
  },
) {
  const { error } = await supabase.from("bookings").update(patch).eq("id", bookingId);
  if (error) throw error;
}
