import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Auth and database features will not work.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Database Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          daily_calories: number;
          protein_goal: number;
          carbs_goal: number;
          fat_goal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          daily_calories?: number;
          protein_goal?: number;
          carbs_goal?: number;
          fat_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          daily_calories?: number;
          protein_goal?: number;
          carbs_goal?: number;
          fat_goal?: number;
          updated_at?: string;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
          created_at?: string;
        };
        Update: {
          meal_type?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
        };
      };
      meal_items: {
        Row: {
          id: string;
          meal_id: string;
          name: string;
          quantity: number;
          grams: number;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
        Insert: {
          id?: string;
          meal_id: string;
          name: string;
          quantity: number;
          grams: number;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
        Update: {
          name?: string;
          quantity?: number;
          grams?: number;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
        };
      };
    };
  };
};
