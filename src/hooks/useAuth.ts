import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export type SignUpParams = {
  email: string;
  password: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

export const auth = {
  async signUp({ email, password }: SignUpParams) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signInWithPassword({ email, password }: SignInParams) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};