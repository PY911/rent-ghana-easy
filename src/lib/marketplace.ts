import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export type ListingWithRelations = Listing & {
  vendor: Vendor | null;
  category: Category | null;
};

export type BookingWithListing = Booking & {
  listing: Pick<Listing, "id" | "title" | "slug" | "images" | "price" | "price_unit"> | null;
  vendor: Pick<Vendor, "id" | "name" | "slug" | "phone" | "whatsapp"> | null;
};

const LISTING_SELECT = "*, vendor:vendors(*), category:categories(*)";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const featuredListingsQuery = queryOptions({
  queryKey: ["listings", "featured"],
  queryFn: async (): Promise<ListingWithRelations[]> => {
    const { data, error } = await supabase
      .from("listings")
      .select(LISTING_SELECT)
      .eq("status", "published")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) throw error;
    return (data ?? []) as unknown as ListingWithRelations[];
  },
});

export const newestListingsQuery = queryOptions({
  queryKey: ["listings", "newest"],
  queryFn: async (): Promise<ListingWithRelations[]> => {
    const { data, error } = await supabase
      .from("listings")
      .select(LISTING_SELECT)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    return (data ?? []) as unknown as ListingWithRelations[];
  },
});

export type BrowseFilters = {
  q?: string;
  category?: string;
  city?: string;
  sort?: string;
  max?: number;
};

export function browseListingsQuery(filters: BrowseFilters) {
  return queryOptions({
    queryKey: ["listings", "browse", filters],
    queryFn: async (): Promise<ListingWithRelations[]> => {
      let query = supabase.from("listings").select(LISTING_SELECT).eq("status", "published");

      if (filters.q) query = query.ilike("title", `%${filters.q}%`);
      if (filters.city) query = query.eq("city", filters.city);
      if (filters.max) query = query.lte("price", filters.max);
      if (filters.category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", filters.category)
          .maybeSingle();
        if (!cat) return [];
        query = query.eq("category_id", cat.id);
      }

      if (filters.sort === "price-asc") query = query.order("price", { ascending: true });
      else if (filters.sort === "price-desc") query = query.order("price", { ascending: false });
      else query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });

      const { data, error } = await query.limit(60);
      if (error) throw error;
      return (data ?? []) as unknown as ListingWithRelations[];
    },
  });
}

export function listingBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["listing", slug],
    queryFn: async (): Promise<ListingWithRelations | null> => {
      const { data, error } = await supabase
        .from("listings")
        .select(LISTING_SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as ListingWithRelations | null) ?? null;
    },
  });
}

export function relatedListingsQuery(categoryId: string | undefined, excludeId: string | undefined) {
  return queryOptions({
    queryKey: ["listings", "related", categoryId, excludeId],
    enabled: Boolean(categoryId),
    queryFn: async (): Promise<ListingWithRelations[]> => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from("listings")
        .select(LISTING_SELECT)
        .eq("status", "published")
        .eq("category_id", categoryId)
        .neq("id", excludeId ?? "")
        .limit(4);
      if (error) throw error;
      return (data ?? []) as unknown as ListingWithRelations[];
    },
  });
}

export function vendorBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["vendor", slug],
    queryFn: async () => {
      const { data: vendor, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!vendor) return null;
      const { data: listings, error: listingError } = await supabase
        .from("listings")
        .select(LISTING_SELECT)
        .eq("vendor_id", vendor.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (listingError) throw listingError;
      return {
        vendor: vendor as Vendor,
        listings: (listings ?? []) as unknown as ListingWithRelations[],
      };
    },
  });
}

export const topVendorsQuery = queryOptions({
  queryKey: ["vendors", "top"],
  queryFn: async (): Promise<Vendor[]> => {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("rating", { ascending: false })
      .limit(4);
    if (error) throw error;
    return data ?? [];
  },
});

export function myBookingsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["bookings", "mine", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<BookingWithListing[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "*, listing:listings(id,title,slug,images,price,price_unit), vendor:vendors(id,name,slug,phone,whatsapp)",
        )
        .eq("renter_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BookingWithListing[];
    },
  });
}

export function myVendorQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["vendor", "mine", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Vendor | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("owner_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });
}

export function vendorListingsQuery(vendorId: string | undefined) {
  return queryOptions({
    queryKey: ["listings", "vendor", vendorId],
    enabled: Boolean(vendorId),
    queryFn: async (): Promise<ListingWithRelations[]> => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from("listings")
        .select(LISTING_SELECT)
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ListingWithRelations[];
    },
  });
}

export function vendorBookingsQuery(vendorId: string | undefined) {
  return queryOptions({
    queryKey: ["bookings", "vendor", vendorId],
    enabled: Boolean(vendorId),
    queryFn: async (): Promise<BookingWithListing[]> => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "*, listing:listings(id,title,slug,images,price,price_unit), vendor:vendors(id,name,slug,phone,whatsapp)",
        )
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BookingWithListing[];
    },
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
