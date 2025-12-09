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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          category: string | null
          created_at: string
          file_type: string | null
          file_url: string
          id: string
          is_public: boolean
          settlement: Database["public"]["Enums"]["settlement_type"]
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_type?: string | null
          file_url: string
          id?: string
          is_public?: boolean
          settlement: Database["public"]["Enums"]["settlement_type"]
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          file_type?: string | null
          file_url?: string
          id?: string
          is_public?: boolean
          settlement?: Database["public"]["Enums"]["settlement_type"]
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          house_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          house_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          house_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          settlement: Database["public"]["Enums"]["settlement_type"]
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          settlement: Database["public"]["Enums"]["settlement_type"]
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          settlement?: Database["public"]["Enums"]["settlement_type"]
          title?: string
        }
        Relationships: []
      }
      houses: {
        Row: {
          advantages: Json | null
          created_at: string
          features: Json | null
          floors: number
          full_description: string | null
          house_area_sqm: number
          house_class: string
          id: string
          images: Json | null
          infrastructure: Json | null
          land_area_sqm: number
          latitude: number | null
          longitude: number | null
          price_rub: number
          rooms: number
          settlement: Database["public"]["Enums"]["settlement_type"]
          short_description: string | null
          status: Database["public"]["Enums"]["plot_status"]
          title: string
          updated_at: string
        }
        Insert: {
          advantages?: Json | null
          created_at?: string
          features?: Json | null
          floors?: number
          full_description?: string | null
          house_area_sqm: number
          house_class?: string
          id?: string
          images?: Json | null
          infrastructure?: Json | null
          land_area_sqm: number
          latitude?: number | null
          longitude?: number | null
          price_rub: number
          rooms?: number
          settlement: Database["public"]["Enums"]["settlement_type"]
          short_description?: string | null
          status?: Database["public"]["Enums"]["plot_status"]
          title: string
          updated_at?: string
        }
        Update: {
          advantages?: Json | null
          created_at?: string
          features?: Json | null
          floors?: number
          full_description?: string | null
          house_area_sqm?: number
          house_class?: string
          id?: string
          images?: Json | null
          infrastructure?: Json | null
          land_area_sqm?: number
          latitude?: number | null
          longitude?: number | null
          price_rub?: number
          rooms?: number
          settlement?: Database["public"]["Enums"]["settlement_type"]
          short_description?: string | null
          status?: Database["public"]["Enums"]["plot_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          published: boolean
          settlement: Database["public"]["Enums"]["settlement_type"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          settlement: Database["public"]["Enums"]["settlement_type"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          settlement?: Database["public"]["Enums"]["settlement_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plots: {
        Row: {
          advantages: Json | null
          area_sqm: number
          cadastral_number: string | null
          created_at: string
          description: string | null
          documents: Json | null
          id: string
          images: Json | null
          latitude: number | null
          longitude: number | null
          plot_number: string
          price_rub: number
          settlement: Database["public"]["Enums"]["settlement_type"]
          status: Database["public"]["Enums"]["plot_status"]
          updated_at: string
        }
        Insert: {
          advantages?: Json | null
          area_sqm: number
          cadastral_number?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          plot_number: string
          price_rub: number
          settlement: Database["public"]["Enums"]["settlement_type"]
          status?: Database["public"]["Enums"]["plot_status"]
          updated_at?: string
        }
        Update: {
          advantages?: Json | null
          area_sqm?: number
          cadastral_number?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          plot_number?: string
          price_rub?: number
          settlement?: Database["public"]["Enums"]["settlement_type"]
          status?: Database["public"]["Enums"]["plot_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          admin_response: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          responded_at: string | null
          responded_by: string | null
          settlement: Database["public"]["Enums"]["settlement_type"]
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          settlement: Database["public"]["Enums"]["settlement_type"]
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          settlement?: Database["public"]["Enums"]["settlement_type"]
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      viewing_requests: {
        Row: {
          created_at: string
          email: string
          house_id: string | null
          id: string
          message: string | null
          name: string
          phone: string
          preferred_date: string | null
          preferred_time: string | null
          settlement: Database["public"]["Enums"]["settlement_type"]
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          house_id?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          preferred_date?: string | null
          preferred_time?: string | null
          settlement: Database["public"]["Enums"]["settlement_type"]
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          house_id?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          preferred_date?: string | null
          preferred_time?: string | null
          settlement?: Database["public"]["Enums"]["settlement_type"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_requests_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_resident_of: {
        Args: {
          _settlement: Database["public"]["Enums"]["settlement_type"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      plot_status: "available" | "reserved" | "sold"
      settlement_type: "zapovednoe" | "kolosok"
      user_role:
        | "admin"
        | "chairman_zapovednoe"
        | "chairman_kolosok"
        | "resident_zapovednoe"
        | "resident_kolosok"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      plot_status: ["available", "reserved", "sold"],
      settlement_type: ["zapovednoe", "kolosok"],
      user_role: [
        "admin",
        "chairman_zapovednoe",
        "chairman_kolosok",
        "resident_zapovednoe",
        "resident_kolosok",
      ],
    },
  },
} as const
