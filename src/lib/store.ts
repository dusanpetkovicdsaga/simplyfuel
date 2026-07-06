import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import type { AnalyzedFood } from "./mock-ai";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

export type MealItem = AnalyzedFood & { id: string };

export type Meal = {
  id: string;
  mealType: MealType;
  createdAt: string; // ISO
  items: MealItem[];
};

export type User = {
  name: string;
  dailyCalories: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
};

type State = {
  user: User;
  meals: Meal[];
  loading: boolean;
  syncing: boolean;
  addMeal: (mealType: MealType, items: Omit<MealItem, "id">[]) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  updateUser: (u: Partial<User>) => Promise<void>;
  loadUserProfile: (userId: string) => Promise<void>;
  loadMeals: (userId: string) => Promise<void>;
  syncToSupabase: (userId: string) => Promise<void>;
  setUser: (user: User) => void;
  setMeals: (meals: Meal[]) => void;
};

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      user: {
        name: "Guest",
        dailyCalories: 2400,
        proteinGoal: 180,
        carbsGoal: 250,
        fatGoal: 80,
      },
      meals: [],
      loading: false,
      syncing: false,

      setUser: (user) => set({ user }),
      setMeals: (meals) => set({ meals }),

      loadUserProfile: async (userId: string) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) throw error;

          if (data) {
            set({
              user: {
                name: data.name,
                dailyCalories: data.daily_calories,
                proteinGoal: data.protein_goal,
                carbsGoal: data.carbs_goal,
                fatGoal: data.fat_goal,
              },
            });
          }
        } catch (error) {
          console.error("Error loading profile:", error);
        } finally {
          set({ loading: false });
        }
      },

      loadMeals: async (userId: string) => {
        set({ loading: true });
        try {
          // Get meals with items
          const { data: mealsData, error: mealsError } = await supabase
            .from("meals")
            .select(`
              id,
              meal_type,
              created_at,
              meal_items (
                id,
                name,
                quantity,
                grams,
                calories,
                protein,
                carbs,
                fat
              )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (mealsError) throw mealsError;

          if (mealsData) {
            const meals: Meal[] = mealsData.map((meal: any) => ({
              id: meal.id,
              mealType: meal.meal_type as MealType,
              createdAt: meal.created_at,
              items: meal.meal_items || [],
            }));

            set({ meals });
          }
        } catch (error) {
          console.error("Error loading meals:", error);
        } finally {
          set({ loading: false });
        }
      },

      addMeal: async (mealType: MealType, items: Omit<MealItem, "id">[]) => {
        const newMeal: Meal = {
          id: crypto.randomUUID(),
          mealType,
          createdAt: new Date().toISOString(),
          items: items.map((i) => ({ ...i, id: crypto.randomUUID() })),
        };

        // Add to local state immediately for optimistic UI
        set((s) => ({ meals: [newMeal, ...s.meals] }));

        // Try to sync to Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Insert meal
            const { data: mealData, error: mealError } = await supabase
              .from("meals")
              .insert({
                id: newMeal.id,
                user_id: user.id,
                meal_type: mealType,
                created_at: newMeal.createdAt,
              })
              .select()
              .single();

            if (mealError) throw mealError;

            // Insert meal items
            const { error: itemsError } = await supabase
              .from("meal_items")
              .insert(
                newMeal.items.map((item) => ({
                  id: item.id,
                  meal_id: newMeal.id,
                  name: item.name,
                  quantity: item.quantity,
                  grams: item.grams,
                  calories: item.calories,
                  protein: item.protein,
                  carbs: item.carbs,
                  fat: item.fat,
                }))
              );

            if (itemsError) throw itemsError;
          }
        } catch (error) {
          console.error("Error syncing meal to Supabase:", error);
          // Meal is already in local state, so user can still see it
        }
      },

      removeMeal: async (id: string) => {
        // Remove from local state immediately
        set((s) => ({ meals: s.meals.filter((m) => m.id !== id) }));

        // Try to delete from Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { error } = await supabase
              .from("meals")
              .delete()
              .eq("id", id)
              .eq("user_id", user.id);

            if (error) throw error;
          }
        } catch (error) {
          console.error("Error deleting meal from Supabase:", error);
        }
      },

      updateUser: async (u: Partial<User>) => {
        // Update local state immediately
        set((s) => ({ user: { ...s.user, ...u } }));

        // Try to update Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { error } = await supabase
              .from("profiles")
              .update({
                name: u.name,
                daily_calories: u.dailyCalories,
                protein_goal: u.proteinGoal,
                carbs_goal: u.carbsGoal,
                fat_goal: u.fatGoal,
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id);

            if (error) throw error;
          }
        } catch (error) {
          console.error("Error updating profile in Supabase:", error);
        }
      },

      syncToSupabase: async (userId: string) => {
        const state = get();
        if (state.syncing) return;

        set({ syncing: true });
        try {
          // Load profile and meals from Supabase
          await get().loadUserProfile(userId);
          await get().loadMeals(userId);
        } catch (error) {
          console.error("Error syncing with Supabase:", error);
        } finally {
          set({ syncing: false });
        }
      },
    }),
    { name: "kal-store-v1" },
  ),
);

export function todaysMeals(meals: Meal[]): Meal[] {
  const today = new Date().toDateString();
  return meals.filter((m) => new Date(m.createdAt).toDateString() === today);
}

export function sumTotals(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => {
      for (const i of m.items) {
        acc.calories += i.calories;
        acc.protein += i.protein;
        acc.carbs += i.carbs;
        acc.fat += i.fat;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
