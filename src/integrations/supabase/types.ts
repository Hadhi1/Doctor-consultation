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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      consultation_preferences: {
        Row: {
          created_at: string | null
          default_advice: string[] | null
          default_follow_up_days: number | null
          id: string
          show_advice: boolean | null
          show_birth_history: boolean | null
          show_diet_chart: boolean | null
          show_drug_history: boolean | null
          show_family_history: boolean | null
          show_investigations: boolean | null
          show_past_history: boolean | null
          show_pregnancy_history: boolean | null
          show_vaccination_history: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_advice?: string[] | null
          default_follow_up_days?: number | null
          id?: string
          show_advice?: boolean | null
          show_birth_history?: boolean | null
          show_diet_chart?: boolean | null
          show_drug_history?: boolean | null
          show_family_history?: boolean | null
          show_investigations?: boolean | null
          show_past_history?: boolean | null
          show_pregnancy_history?: boolean | null
          show_vaccination_history?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_advice?: string[] | null
          default_follow_up_days?: number | null
          id?: string
          show_advice?: boolean | null
          show_birth_history?: boolean | null
          show_diet_chart?: boolean | null
          show_drug_history?: boolean | null
          show_family_history?: boolean | null
          show_investigations?: boolean | null
          show_past_history?: boolean | null
          show_pregnancy_history?: boolean | null
          show_vaccination_history?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          consultation_data_encrypted: string
          consultation_date: string | null
          created_at: string | null
          diagnosis: string | null
          id: string
          patient_address: string | null
          patient_age: string | null
          patient_gender: string | null
          patient_name: string
          patient_occupation: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consultation_data_encrypted: string
          consultation_date?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          patient_address?: string | null
          patient_age?: string | null
          patient_gender?: string | null
          patient_name: string
          patient_occupation?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consultation_data_encrypted?: string
          consultation_date?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          patient_address?: string | null
          patient_age?: string | null
          patient_gender?: string | null
          patient_name?: string
          patient_occupation?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          clinic_address: string | null
          clinic_logo_url: string | null
          clinic_name: string | null
          clinic_phone: string | null
          created_at: string | null
          doctor_name: string | null
          doctor_qualifications: string | null
          email: string
          full_name: string | null
          id: string
          registration_number: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_address?: string | null
          clinic_logo_url?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          created_at?: string | null
          doctor_name?: string | null
          doctor_qualifications?: string | null
          email: string
          full_name?: string | null
          id: string
          registration_number?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_address?: string | null
          clinic_logo_url?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          created_at?: string | null
          doctor_name?: string | null
          doctor_qualifications?: string | null
          email?: string
          full_name?: string | null
          id?: string
          registration_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          id: string
          total_credits: number | null
          updated_at: string | null
          used_credits: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          total_credits?: number | null
          updated_at?: string | null
          used_credits?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          total_credits?: number | null
          updated_at?: string | null
          used_credits?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_remaining_credits: {
        Args: { check_user_id: string }
        Returns: number
      }
      has_credits: { Args: { check_user_id: string }; Returns: boolean }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
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
      app_role: ["admin", "user"],
    },
  },
} as const
