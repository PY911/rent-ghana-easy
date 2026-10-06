export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          admin_notes: string | null
          balance_amount: number
          balance_due_date: string | null
          balance_paid_at: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          delivery_address: string | null
          deposit_amount: number
          deposit_paid_at: string | null
          end_date: string
          id: string
          listing_id: string
          notes: string | null
          payment_status: string
          platform_fee: number
          quantity: number
          reference: string | null
          renter_id: string
          start_date: string
          status: string
          total: number
          vendor_id: string
          vendor_total: number
        }
        Insert: {
          admin_notes?: string | null
          balance_amount?: number
          balance_due_date?: string | null
          balance_paid_at?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          deposit_amount?: number
          deposit_paid_at?: string | null
          end_date: string
          id?: string
          listing_id: string
          notes?: string | null
          payment_status?: string
          platform_fee?: number
          quantity?: number
          reference?: string | null
          renter_id: string
          start_date: string
          status?: string
          total?: number
          vendor_id: string
          vendor_total?: number
        }
        Update: {
          admin_notes?: string | null
          balance_amount?: number
          balance_due_date?: string | null
          balance_paid_at?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          deposit_amount?: number
          deposit_paid_at?: string | null
          end_date?: string
          id?: string
          listing_id?: string
          notes?: string | null
          payment_status?: string
          platform_fee?: number
          quantity?: number
          reference?: string | null
          renter_id?: string
          start_date?: string
          status?: string
          total?: number
          vendor_id?: string
          vendor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      listings: {
        Row: {
          admin_approved: boolean
          admin_notes: string | null
          category_id: string
          city: string
          created_at: string
          description: string | null
          featured: boolean
          id: string
          images: string[]
          min_days: number
          price: number
          price_unit: string
          quantity: number
          slug: string
          status: string
          title: string
          vendor_id: string
          vendor_price: number | null
        }
        Insert: {
          admin_approved?: boolean
          admin_notes?: string | null
          category_id: string
          city?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          images?: string[]
          min_days?: number
          price: number
          price_unit?: string
          quantity?: number
          slug: string
          status?: string
          title: string
          vendor_id: string
          vendor_price?: number | null
        }
        Update: {
          admin_approved?: boolean
          admin_notes?: string | null
          category_id?: string
          city?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          images?: string[]
          min_days?: number
          price?: number
          price_unit?: string
          quantity?: number
          slug?: string
          status?: string
          title?: string
          vendor_id?: string
          vendor_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_applications: {
        Row: {
          address: string
          applicant_id: string
          business_description: string
          business_name: string
          city: string
          contact_name: string
          created_at: string
          email: string
          id: string
          inventory_details: string
          phone: string
          status: string
          whatsapp: string | null
        }
        Insert: {
          address: string
          applicant_id: string
          business_description: string
          business_name: string
          city: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          inventory_details: string
          phone: string
          status?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string
          applicant_id?: string
          business_description?: string
          business_name?: string
          city?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          inventory_details?: string
          phone?: string
          status?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          about: string | null
          address: string | null
          approved: boolean
          city: string
          created_at: string
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          owner_id: string | null
          phone: string | null
          place_id: string | null
          rating: number
          review_count: number
          slug: string
          verified: boolean
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          approved?: boolean
          city?: string
          created_at?: string
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          place_id?: string | null
          rating?: number
          review_count?: number
          slug: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          approved?: boolean
          city?: string
          created_at?: string
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          place_id?: string | null
          rating?: number
          review_count?: number
          slug?: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_listings: {
        Row: {
          category_id: string | null
          city: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string | null
          images: string[] | null
          min_days: number | null
          price: number | null
          price_unit: string | null
          quantity: number | null
          slug: string | null
          status: string | null
          title: string | null
          vendor_id: string | null
        }
        Insert: {
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string | null
          images?: string[] | null
          min_days?: number | null
          price?: number | null
          price_unit?: string | null
          quantity?: number | null
          slug?: string | null
          status?: string | null
          title?: string | null
          vendor_id?: string | null
        }
        Update: {
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string | null
          images?: string[] | null
          min_days?: number | null
          price?: number | null
          price_unit?: string | null
          quantity?: number | null
          slug?: string | null
          status?: string | null
          title?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      public_vendors: {
        Row: {
          about: string | null
          address: string | null
          approved: boolean | null
          city: string | null
          created_at: string | null
          id: string | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string | null
          place_id: string | null
          rating: number | null
          review_count: number | null
          slug: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          approved?: boolean | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          place_id?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          approved?: boolean | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          place_id?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assert_booking_capacity: {
        Args: {
          p_end_date: string
          p_exclude_booking_id?: string
          p_listing_id: string
          p_quantity: number
          p_start_date: string
        }
        Returns: undefined
      }
      get_public_vendors: {
        Args: never
        Returns: {
          about: string
          address: string
          approved: boolean
          city: string
          created_at: string
          id: string
          latitude: number
          logo_url: string
          longitude: number
          name: string
          place_id: string
          rating: number
          review_count: number
          slug: string
          verified: boolean
          website: string
        }[]
      }
      get_unavailable_listing_dates: {
        Args: { p_listing_id: string }
        Returns: {
          unavailable_date: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      request_booking: {
        Args: {
          p_contact_name: string
          p_contact_phone: string
          p_delivery_address: string
          p_end_date: string
          p_listing_id: string
          p_notes?: string
          p_quantity: number
          p_start_date: string
        }
        Returns: {
          id: string
          reference: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
