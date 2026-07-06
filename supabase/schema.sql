-- =============================================
-- SimplyFuel Database Schema
-- =============================================
-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
-- User profiles linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    daily_calories INTEGER NOT NULL DEFAULT 2400,
    protein_goal INTEGER NOT NULL DEFAULT 180,
    carbs_goal INTEGER NOT NULL DEFAULT 250,
    fat_goal INTEGER NOT NULL DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =============================================
-- MEALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON public.meals(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Meals Policies
CREATE POLICY "Users can view own meals"
    ON public.meals
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
    ON public.meals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
    ON public.meals
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- MEAL_ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.meal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    grams NUMERIC(10, 2) NOT NULL,
    calories NUMERIC(10, 2) NOT NULL,
    protein NUMERIC(10, 2) NOT NULL,
    carbs NUMERIC(10, 2) NOT NULL,
    fat NUMERIC(10, 2) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id ON public.meal_items(meal_id);

-- Enable Row Level Security
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

-- Meal Items Policies (access through meals)
CREATE POLICY "Users can view own meal items"
    ON public.meal_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.meals
            WHERE meals.id = meal_items.meal_id
            AND meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own meal items"
    ON public.meal_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meals
            WHERE meals.id = meal_items.meal_id
            AND meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own meal items"
    ON public.meal_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.meals
            WHERE meals.id = meal_items.meal_id
            AND meals.user_id = auth.uid()
        )
    );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- HELPER VIEWS
-- =============================================

-- View for meals with aggregated nutrition
CREATE OR REPLACE VIEW public.meals_with_totals AS
SELECT
    m.id,
    m.user_id,
    m.meal_type,
    m.created_at,
    COALESCE(SUM(mi.calories), 0) AS total_calories,
    COALESCE(SUM(mi.protein), 0) AS total_protein,
    COALESCE(SUM(mi.carbs), 0) AS total_carbs,
    COALESCE(SUM(mi.fat), 0) AS total_fat,
    json_agg(
        json_build_object(
            'id', mi.id,
            'name', mi.name,
            'quantity', mi.quantity,
            'grams', mi.grams,
            'calories', mi.calories,
            'protein', mi.protein,
            'carbs', mi.carbs,
            'fat', mi.fat
        )
    ) FILTER (WHERE mi.id IS NOT NULL) AS items
FROM public.meals m
LEFT JOIN public.meal_items mi ON mi.meal_id = m.id
GROUP BY m.id, m.user_id, m.meal_type, m.created_at;

-- Grant select permission on view
GRANT SELECT ON public.meals_with_totals TO authenticated;

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================
/*
-- Insert test meal (replace USER_ID with your auth user ID)
INSERT INTO public.meals (user_id, meal_type)
VALUES ('USER_ID', 'Breakfast')
RETURNING id;

-- Insert meal items (replace MEAL_ID with the ID from above)
INSERT INTO public.meal_items (meal_id, name, quantity, grams, calories, protein, carbs, fat)
VALUES
    ('MEAL_ID', 'Eggs', 2, 100, 156, 12, 2, 10),
    ('MEAL_ID', 'Toast', 2, 60, 160, 6, 28, 2);
*/

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'SimplyFuel schema created successfully!';
    RAISE NOTICE 'Tables: profiles, meals, meal_items';
    RAISE NOTICE 'Views: meals_with_totals';
    RAISE NOTICE 'RLS policies enabled for security';
END $$;
