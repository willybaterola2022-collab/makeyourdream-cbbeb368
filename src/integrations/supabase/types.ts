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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_completions: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          recording_id: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          recording_id?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          recording_id?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      collab_rooms: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          max_participants: number
          participants: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          max_participants?: number
          participants?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          max_participants?: number
          participants?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          active_date: string
          challenge_type: string
          created_at: string
          description: string | null
          id: string
          reward_xp: number
          target_criteria: Json | null
          title: string
        }
        Insert: {
          active_date?: string
          challenge_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reward_xp?: number
          target_criteria?: Json | null
          title: string
        }
        Update: {
          active_date?: string
          challenge_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reward_xp?: number
          target_criteria?: Json | null
          title?: string
        }
        Relationships: []
      }
      duels: {
        Row: {
          challenger_id: string
          challenger_score: number | null
          created_at: string
          id: string
          opponent_id: string | null
          opponent_score: number | null
          song_title: string | null
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          challenger_id: string
          challenger_score?: number | null
          created_at?: string
          id?: string
          opponent_id?: string | null
          opponent_score?: number | null
          song_title?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          challenger_id?: string
          challenger_score?: number | null
          created_at?: string
          id?: string
          opponent_id?: string | null
          opponent_score?: number | null
          song_title?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          vocal_level: string | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          vocal_level?: string | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          vocal_level?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      recording_comparisons: {
        Row: {
          created_at: string
          delta_expression: number | null
          delta_overall: number | null
          delta_pitch: number | null
          delta_timing: number | null
          id: string
          recording_a_id: string
          recording_b_id: string
          summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta_expression?: number | null
          delta_overall?: number | null
          delta_pitch?: number | null
          delta_timing?: number | null
          id?: string
          recording_a_id: string
          recording_b_id: string
          summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta_expression?: number | null
          delta_overall?: number | null
          delta_pitch?: number | null
          delta_timing?: number | null
          id?: string
          recording_a_id?: string
          recording_b_id?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recording_comparisons_recording_a_id_fkey"
            columns: ["recording_a_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recording_comparisons_recording_b_id_fkey"
            columns: ["recording_b_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      recordings: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_path: string
          file_url: string
          id: string
          metadata: Json | null
          module: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_path: string
          file_url: string
          id?: string
          metadata?: Json | null
          module: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_path?: string
          file_url?: string
          id?: string
          metadata?: Json | null
          module?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      share_cards: {
        Row: {
          card_data: Json | null
          card_type: string
          created_at: string
          fingerprint_id: string | null
          id: string
          image_url: string | null
          share_count: number
          user_id: string
        }
        Insert: {
          card_data?: Json | null
          card_type?: string
          created_at?: string
          fingerprint_id?: string | null
          id?: string
          image_url?: string | null
          share_count?: number
          user_id: string
        }
        Update: {
          card_data?: Json | null
          card_type?: string
          created_at?: string
          fingerprint_id?: string | null
          id?: string
          image_url?: string | null
          share_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_cards_fingerprint_id_fkey"
            columns: ["fingerprint_id"]
            isOneToOne: false
            referencedRelation: "vocal_fingerprints"
            referencedColumns: ["id"]
          },
        ]
      }
      social_feed: {
        Row: {
          caption: string | null
          comments_count: number
          created_at: string
          id: string
          likes_count: number
          recording_id: string | null
          score: number | null
          song_title: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          likes_count?: number
          recording_id?: string | null
          score?: number | null
          song_title?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          likes_count?: number
          recording_id?: string | null
          score?: number | null
          song_title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_feed_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      song_sketches: {
        Row: {
          blocks: Json | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blocks?: Json | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blocks?: Json | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          created_at: string
          expression_score: number | null
          id: string
          module: string
          overall_score: number | null
          pitch_score: number | null
          recording_id: string | null
          song_title: string | null
          timing_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expression_score?: number | null
          id?: string
          module?: string
          overall_score?: number | null
          pitch_score?: number | null
          recording_id?: string | null
          song_title?: string | null
          timing_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          expression_score?: number | null
          id?: string
          module?: string
          overall_score?: number | null
          pitch_score?: number | null
          recording_id?: string | null
          song_title?: string | null
          timing_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          badges: Json | null
          created_at: string
          id: string
          last_active_date: string | null
          level: number
          longest_streak: number
          streak_days: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          badges?: Json | null
          created_at?: string
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          streak_days?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          badges?: Json | null
          created_at?: string
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp?: number
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
      vocal_fingerprints: {
        Row: {
          classification: string | null
          created_at: string
          dimensions: Json | null
          global_score: number | null
          id: string
          recording_id: string | null
          similar_artists: Json | null
          user_id: string
          vocal_range_high: number | null
          vocal_range_low: number | null
        }
        Insert: {
          classification?: string | null
          created_at?: string
          dimensions?: Json | null
          global_score?: number | null
          id?: string
          recording_id?: string | null
          similar_artists?: Json | null
          user_id: string
          vocal_range_high?: number | null
          vocal_range_low?: number | null
        }
        Update: {
          classification?: string | null
          created_at?: string
          dimensions?: Json | null
          global_score?: number | null
          id?: string
          recording_id?: string | null
          similar_artists?: Json | null
          user_id?: string
          vocal_range_high?: number | null
          vocal_range_low?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vocal_fingerprints_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_journal_entries: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          pitch_accuracy: number | null
          power_level: number | null
          recording_id: string | null
          user_id: string
          vocal_range: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          pitch_accuracy?: number | null
          power_level?: number | null
          recording_id?: string | null
          user_id: string
          vocal_range?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          pitch_accuracy?: number | null
          power_level?: number | null
          recording_id?: string | null
          user_id?: string
          vocal_range?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_journal_entries_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_leaderboard: {
        Row: {
          created_at: string
          id: string
          league: string
          rank: number | null
          user_id: string
          week_start: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          id?: string
          league?: string
          rank?: number | null
          user_id: string
          week_start: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          id?: string
          league?: string
          rank?: number | null
          user_id?: string
          week_start?: string
          xp_earned?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_was: { Args: { weeks_back?: number }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_likes: { Args: { p_post_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
