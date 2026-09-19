import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookingWithListing, ListingWithRelations } from "@/lib/marketplace";
import { quoteBooking } from "@/lib/pricing";

export function bookingReference() {
  const random = Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(0, 6);
  return `YW-${random.toUpperCase()}`;
}

export type BookingRequestInput = {
  listing: ListingWithRelations;
  renterId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  contactName: string;
  contactPhone: string;
  deliveryAddress: string;
  notes: string;
};

export async function createBookingRequest(input: BookingRequestInput) {
  const quote = quoteBooking({
    price: Number(input.listing.price),
    vendorPrice: input.listing.vendor_price === null ? null : Number(input.listing.vendor_price),
    priceUnit: input.listing.price_unit,
    minDays: input.listing.min_days,
    quantity: input.quantity,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      listing_id: input.listing.id,
      vendor_id: input.listing.vendor_id,
      renter_id: input.renterId,
      start_date: input.startDate,
      end_date: input.endDate,
      quantity: input.quantity,
      total: quote.total,
      vendor_total: quote.vendorTotal,
      platform_fee: quote.platformFee,
      deposit_amount: quote.depositAmount,
      balance_amount: quote.balanceAmount,
      balance_due_date: quote.balanceDueDate,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      delivery_address: input.deliveryAddress,
      notes: input.notes || null,
      status: "pending",
      payment_status: "unpaid",
      reference: bookingReference(),
    })
    .select("id, reference")
    .single();

  if (error) throw error;
  return data;
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
