import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] ⚠️  Variables de entorno no configuradas.\n" +
    "   Por favor, agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env\n" +
    "   Puedes copiar .env.example a .env y completar los valores."
  );
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || "",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          avatar_url?: string | null;
        };
      };
    };
  };
};
