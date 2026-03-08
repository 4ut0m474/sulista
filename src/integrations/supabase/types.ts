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
      admin_city_content: {
        Row: {
          city: string
          data: Json
          id: string
          section: string
          state_abbr: string
          updated_at: string
        }
        Insert: {
          city: string
          data?: Json
          id?: string
          section: string
          state_abbr: string
          updated_at?: string
        }
        Update: {
          city?: string
          data?: Json
          id?: string
          section?: string
          state_abbr?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_config: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          city: string | null
          created_at: string
          description: string
          id: string
          read: boolean
          state_abbr: string | null
          title: string
          type: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          description: string
          id?: string
          read?: boolean
          state_abbr?: string | null
          title: string
          type: string
        }
        Update: {
          city?: string | null
          created_at?: string
          description?: string
          id?: string
          read?: boolean
          state_abbr?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      anonymous_profiles: {
        Row: {
          created_at: string
          id: string
          pin_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pin_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pin_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          comentario: string | null
          comercio_id: string
          created_at: string
          id: string
          nota: number
          user_id: string
        }
        Insert: {
          comentario?: string | null
          comercio_id: string
          created_at?: string
          id?: string
          nota: number
          user_id: string
        }
        Update: {
          comentario?: string | null
          comercio_id?: string
          created_at?: string
          id?: string
          nota?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "establishments_public"
            referencedColumns: ["id"]
          },
        ]
      }
      cidade_imagens: {
        Row: {
          cidade: string
          filtro_cor: string | null
          id: string
          state_abbr: string
          updated_at: string
          url_carrossel1: string | null
          url_carrossel2: string | null
          url_carrossel3: string | null
          url_carrossel4: string | null
          url_carrossel5: string | null
          url_fundo: string
        }
        Insert: {
          cidade: string
          filtro_cor?: string | null
          id?: string
          state_abbr: string
          updated_at?: string
          url_carrossel1?: string | null
          url_carrossel2?: string | null
          url_carrossel3?: string | null
          url_carrossel4?: string | null
          url_carrossel5?: string | null
          url_fundo: string
        }
        Update: {
          cidade?: string
          filtro_cor?: string | null
          id?: string
          state_abbr?: string
          updated_at?: string
          url_carrossel1?: string | null
          url_carrossel2?: string | null
          url_carrossel3?: string | null
          url_carrossel4?: string | null
          url_carrossel5?: string | null
          url_fundo?: string
        }
        Relationships: []
      }
      establishments: {
        Row: {
          address: string | null
          avg_rating: number | null
          category: string
          city: string
          created_at: string
          description: string | null
          id: string
          is_vip: boolean | null
          name: string
          phone: string | null
          photo_url: string | null
          state_abbr: string
          sub_location: string | null
          total_votes: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avg_rating?: number | null
          category?: string
          city: string
          created_at?: string
          description?: string | null
          id?: string
          is_vip?: boolean | null
          name: string
          phone?: string | null
          photo_url?: string | null
          state_abbr: string
          sub_location?: string | null
          total_votes?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avg_rating?: number | null
          category?: string
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          is_vip?: boolean | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          state_abbr?: string
          sub_location?: string | null
          total_votes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      persistence_verifications: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          back_image_encrypted: string | null
          created_at: string
          document_id_encrypted: string | null
          document_type: string | null
          email: string
          front_image_encrypted: string | null
          full_name_encrypted: string | null
          id: string
          pin_hash: string
          rejection_reason: string | null
          selfie_image_encrypted: string | null
          updated_at: string
          user_id: string
          verification_status: string
          verified: boolean
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          back_image_encrypted?: string | null
          created_at?: string
          document_id_encrypted?: string | null
          document_type?: string | null
          email: string
          front_image_encrypted?: string | null
          full_name_encrypted?: string | null
          id?: string
          pin_hash: string
          rejection_reason?: string | null
          selfie_image_encrypted?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
          verified?: boolean
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          back_image_encrypted?: string | null
          created_at?: string
          document_id_encrypted?: string | null
          document_type?: string | null
          email?: string
          front_image_encrypted?: string | null
          full_name_encrypted?: string | null
          id?: string
          pin_hash?: string
          rejection_reason?: string | null
          selfie_image_encrypted?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
          verified?: boolean
        }
        Relationships: []
      }
      student_persistence: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          birth_date_encrypted: string
          created_at: string
          face_photo_hash: string | null
          id: string
          name_encrypted: string
          rejection_reason: string | null
          rg_photo_hash: string | null
          rg_responsavel_encrypted: string
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          birth_date_encrypted: string
          created_at?: string
          face_photo_hash?: string | null
          id?: string
          name_encrypted: string
          rejection_reason?: string | null
          rg_photo_hash?: string | null
          rg_responsavel_encrypted: string
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          birth_date_encrypted?: string
          created_at?: string
          face_photo_hash?: string | null
          id?: string
          name_encrypted?: string
          rejection_reason?: string | null
          rg_photo_hash?: string | null
          rg_responsavel_encrypted?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      sulcoins: {
        Row: {
          atualizado_em: string
          saldo: number
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          saldo?: number
          user_id: string
        }
        Update: {
          atualizado_em?: string
          saldo?: number
          user_id?: string
        }
        Relationships: []
      }
      sulcoins_log: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      transfers: {
        Row: {
          confirmada: boolean
          created_at: string
          de_id: string
          id: string
          motivo: string | null
          para_id: string
          valor: number
        }
        Insert: {
          confirmada?: boolean
          created_at?: string
          de_id: string
          id?: string
          motivo?: string | null
          para_id: string
          valor: number
        }
        Update: {
          confirmada?: boolean
          created_at?: string
          de_id?: string
          id?: string
          motivo?: string | null
          para_id?: string
          valor?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          aprendizado: Json | null
          cidade: string | null
          created_at: string
          historico_conversas: Json | null
          id: string
          idade: number | null
          interesses_geral: string[] | null
          necessidades: Json | null
          nome: string | null
          perfil_gastronomico: Json | null
          preferencias_compras_coletivas: Json | null
          ultima_interacao: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          aprendizado?: Json | null
          cidade?: string | null
          created_at?: string
          historico_conversas?: Json | null
          id?: string
          idade?: number | null
          interesses_geral?: string[] | null
          necessidades?: Json | null
          nome?: string | null
          perfil_gastronomico?: Json | null
          preferencias_compras_coletivas?: Json | null
          ultima_interacao?: string | null
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          aprendizado?: Json | null
          cidade?: string | null
          created_at?: string
          historico_conversas?: Json | null
          id?: string
          idade?: number | null
          interesses_geral?: string[] | null
          necessidades?: Json | null
          nome?: string | null
          perfil_gastronomico?: Json | null
          preferencias_compras_coletivas?: Json | null
          ultima_interacao?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
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
      votes: {
        Row: {
          comment: string | null
          created_at: string
          device_fingerprint: string
          establishment_id: string
          id: string
          rating: number
          voter_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          device_fingerprint: string
          establishment_id: string
          id?: string
          rating: number
          voter_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          device_fingerprint?: string
          establishment_id?: string
          id?: string
          rating?: number
          voter_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      establishments_public: {
        Row: {
          address: string | null
          avg_rating: number | null
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_vip: boolean | null
          name: string | null
          photo_url: string | null
          state_abbr: string | null
          sub_location: string | null
          total_votes: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avg_rating?: number | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_vip?: boolean | null
          name?: string | null
          photo_url?: string | null
          state_abbr?: string | null
          sub_location?: string | null
          total_votes?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avg_rating?: number | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_vip?: boolean | null
          name?: string | null
          photo_url?: string | null
          state_abbr?: string | null
          sub_location?: string | null
          total_votes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      transfer_sulcoins: {
        Args: {
          p_amount: number
          p_from_user: string
          p_reason?: string
          p_to_user: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "merchant" | "user"
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
      app_role: ["admin", "moderator", "merchant", "user"],
    },
  },
} as const
