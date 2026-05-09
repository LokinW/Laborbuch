// Hand-written subset of the Supabase types. Replace with output of
// `npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts`
// once your project is set up.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          created_at?: string
        }
        Update: Partial<{
          display_name: string
        }>
        Relationships: []
      }
      machines: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: Partial<{
          name: string
          description: string | null
          image_url: string | null
          sort_order: number
        }>
        Relationships: []
      }
      reservations: {
        Row: {
          id: string
          machine_id: string
          user_id: string
          slot_date: string
          slot_hour: number
          created_at: string
        }
        Insert: {
          id?: string
          machine_id: string
          user_id: string
          slot_date: string
          slot_hour: number
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          machine_id: string
          user_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          machine_id: string
          user_id: string
          body: string
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      favorites: {
        Row: {
          user_id: string
          machine_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          machine_id: string
          created_at?: string
        }
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
