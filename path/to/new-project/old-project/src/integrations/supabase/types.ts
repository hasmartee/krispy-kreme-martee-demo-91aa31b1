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
      delivery_items: {
        Row: {
          created_at: string
          delivery_log_id: string
          id: string
          ingredient_id: string
          quantity_ordered: number
          quantity_received: number
          unit: string
        }
        Insert: {
          created_at?: string
          delivery_log_id: string
          id?: string
          ingredient_id: string
          quantity_ordered: number
          quantity_received: number
          unit: string
        }
        Update: {
          created_at?: string
          delivery_log_id?: string
          id?: string
          ingredient_id?: string
          quantity_ordered?: number
          quantity_received?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_items_delivery_log_id_fkey"
            columns: ["delivery_log_id"]
            isOneToOne: false
            referencedRelation: "delivery_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_logs: {
        Row: {
          created_at: string
          delivery_date: string
          id: string
          notes: string | null
          receipt_url: string | null
          received_by: string
          status: string
          store_id: string
          supplier_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_date: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          received_by: string
          status?: string
          store_id: string
          supplier_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_date?: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          received_by?: string
          status?: string
          store_id?: string
          supplier_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_schedules: {
        Row: {
          created_at: string
          day_of_week: string
          delivery_time: string
          delivery_type: string
          id: string
          is_active: boolean
          notes: string | null
          store_id: string
          supplier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          delivery_time: string
          delivery_type: string
          id?: string
          is_active?: boolean
          notes?: string | null
          store_id: string
          supplier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          delivery_time?: string
          delivery_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          store_id?: string
          supplier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_schedules_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_suppliers: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          supplier_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          supplier_name: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          supplier_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_suppliers_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      ingredients_inventory: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          ingredient_id: string
          last_updated: string
          min_stock_level: number
          store_id: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          ingredient_id: string
          last_updated?: string
          min_stock_level?: number
          store_id: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          ingredient_id?: string
          last_updated?: string
          min_stock_level?: number
          store_id?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_inventory_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_inventory_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      par_levels: {
        Row: {
          created_at: string
          day_of_week: number | null
          id: string
          is_overridden: boolean
          manual_override: number | null
          month: number | null
          product_id: string
          store_id: string
          suggested_par_level: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          id?: string
          is_overridden?: boolean
          manual_override?: number | null
          month?: number | null
          product_id: string
          store_id: string
          suggested_par_level: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          id?: string
          is_overridden?: boolean
          manual_override?: number | null
          month?: number | null
          product_id?: string
          store_id?: string
          suggested_par_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "par_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "par_levels_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_capacities: {
        Row: {
          capacity_max: number
          capacity_min: number
          created_at: string
          id: string
          product_sku: string
          store_id: string
          updated_at: string
        }
        Insert: {
          capacity_max?: number
          capacity_min?: number
          created_at?: string
          id?: string
          product_sku: string
          store_id: string
          updated_at?: string
        }
        Update: {
          capacity_max?: number
          capacity_min?: number
          created_at?: string
          id?: string
          product_sku?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_capacities_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      production_allocations: {
        Row: {
          created_at: string
          day_part: string
          id: string
          manufactured_quantity: number | null
          product_id: string | null
          product_sku: string
          production_plan_id: string
          quantity: number
          received_quantity: number | null
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_part: string
          id?: string
          manufactured_quantity?: number | null
          product_id?: string | null
          product_sku: string
          production_plan_id: string
          quantity?: number
          received_quantity?: number | null
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_part?: string
          id?: string
          manufactured_quantity?: number | null
          product_id?: string | null
          product_sku?: string
          production_plan_id?: string
          quantity?: number
          received_quantity?: number | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_allocations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_allocations_production_plan_id_fkey"
            columns: ["production_plan_id"]
            isOneToOne: false
            referencedRelation: "production_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_allocations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      production_plans: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          production_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          production_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          production_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          sku: string
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          sku: string
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          sku?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          store_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          product_id: string
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          product_id: string
          quantity: number
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          product_id?: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          adjustment_type: string
          comment: string | null
          created_at: string
          created_by: string
          id: string
          product_id: string
          quantity: number
          store_id: string
          updated_at: string
        }
        Insert: {
          adjustment_type: string
          comment?: string | null
          created_at?: string
          created_by: string
          id?: string
          product_id: string
          quantity: number
          store_id: string
          updated_at?: string
        }
        Update: {
          adjustment_type?: string
          comment?: string | null
          created_at?: string
          created_by?: string
          id?: string
          product_id?: string
          quantity?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_inventory: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          last_updated: string
          product_id: string
          store_id: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          last_updated?: string
          product_id: string
          store_id: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          last_updated?: string
          product_id?: string
          store_id?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_inventory_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          cluster: string | null
          created_at: string
          daily_target: number
          id: string
          manager: string
          name: string
          opening_hours: string
          phone: string
          postcode: string
          status: string
          store_id: string
          updated_at: string
          weekly_average: number
        }
        Insert: {
          address: string
          cluster?: string | null
          created_at?: string
          daily_target?: number
          id?: string
          manager: string
          name: string
          opening_hours: string
          phone: string
          postcode: string
          status?: string
          store_id: string
          updated_at?: string
          weekly_average?: number
        }
        Update: {
          address?: string
          cluster?: string | null
          created_at?: string
          daily_target?: number
          id?: string
          manager?: string
          name?: string
          opening_hours?: string
          phone?: string
          postcode?: string
          status?: string
          store_id?: string
          updated_at?: string
          weekly_average?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          available_days: string[]
          created_at: string
          full_name: string
          hourly_rate: number
          id: string
          is_active: boolean
          role: string
          seniority: string
          start_date: string
          store_id: string
          updated_at: string
        }
        Insert: {
          available_days?: string[]
          created_at?: string
          full_name: string
          hourly_rate: number
          id?: string
          is_active?: boolean
          role: string
          seniority: string
          start_date: string
          store_id: string
          updated_at?: string
        }
        Update: {
          available_days?: string[]
          created_at?: string
          full_name?: string
          hourly_rate?: number
          id?: string
          is_active?: boolean
          role?: string
          seniority?: string
          start_date?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          priority: string
          status: string
          store_id: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type: string
          priority?: string
          status?: string
          store_id?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          priority?: string
          status?: string
          store_id?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_store: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "store_manager" | "staff" | "demand_planner"
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
      app_role: ["admin", "store_manager", "staff", "demand_planner"],
    },
  },
} as const
