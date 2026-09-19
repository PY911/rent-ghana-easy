import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ListingWithRelations, Vendor } from "@/lib/marketplace";

export const pendingListingsQuery = queryOptions({
  queryKey: ["admin", "listings", "pending"],
  queryFn: async (): Promise<ListingWithRelations[]> => {
    const { data, error } = await supabase
      .from("listings")
      .select("*, vendor:vendors(*), category:categories(*)")
      .eq("admin_approved", false)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    return (data ?? []) as unknown as ListingWithRelations[];
  },
});

export const adminListingsQuery = queryOptions({
  queryKey: ["admin", "listings", "all"],
  queryFn: async (): Promise<ListingWithRelations[]> => {
    const { data, error } = await supabase
      .from("listings")
      .select("*, vendor:vendors(*), category:categories(*)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as unknown as ListingWithRelations[];
  },
});

export const pendingVendorsQuery = queryOptions({
  queryKey: ["admin", "vendors", "pending"],
  queryFn: async (): Promise<Vendor[]> => {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("approved", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export async function updateListingPricing(
  listingId: string,
  patch: { price?: number; vendor_price?: number; admin_approved?: boolean; status?: string },
) {
  const { error } = await supabase.from("listings").update(patch).eq("id", listingId);
  if (error) throw error;
}

export async function approveVendor(vendorId: string, approved: boolean) {
  const { error } = await supabase.from("vendors").update({ approved }).eq("id", vendorId);
  if (error) throw error;
}
