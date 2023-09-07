export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      chat_history: {
        Row: {
          chat_history: Json[] | null;
          created_at: string;
          id: number;
          title: string | null;
          user_email: string;
        };
        Insert: {
          chat_history?: Json[] | null;
          created_at?: string;
          id?: number;
          title?: string | null;
          user_email: string;
        };
        Update: {
          chat_history?: Json[] | null;
          created_at?: string;
          id?: number;
          title?: string | null;
          user_email?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
