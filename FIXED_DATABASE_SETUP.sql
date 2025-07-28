-- FIXED DATABASE SETUP FOR MYBIRD APP
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and run it
-- This will create all tables, relationships, policies, and triggers

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS eggs CASCADE;
DROP TABLE IF EXISTS nests CASCADE;
DROP TABLE IF EXISTS couples CASCADE;
DROP TABLE IF EXISTS birds CASCADE;
DROP TABLE IF EXISTS aviaries CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- REMOVED: ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
-- This line causes the permission error because auth.users is managed by Supabase

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create aviaries table (create this first since birds references it)
CREATE TABLE aviaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 1,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create birds table
CREATE TABLE birds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  subspecies TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')) NOT NULL,
  birth_date DATE,
  ring_number TEXT,
  color_mutation TEXT,
  origin TEXT CHECK (origin IN ('purchased', 'bred', 'rescue')) DEFAULT 'purchased',
  status TEXT CHECK (status IN ('active', 'deceased', 'sold', 'exchanged')) DEFAULT 'active',
  notes TEXT,
  image_url TEXT,
  father_id UUID REFERENCES birds(id) ON DELETE SET NULL,
  mother_id UUID REFERENCES birds(id) ON DELETE SET NULL,
  aviary_id UUID REFERENCES aviaries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create couples table
CREATE TABLE couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  male_bird_id UUID REFERENCES birds(id) ON DELETE CASCADE NOT NULL,
  female_bird_id UUID REFERENCES birds(id) ON DELETE CASCADE NOT NULL,
  pair_date DATE NOT NULL DEFAULT CURRENT_DATE,
  season TEXT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'separated')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_birds CHECK (male_bird_id != female_bird_id)
);

-- Create nests table
CREATE TABLE nests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  aviary_id UUID REFERENCES aviaries(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_hatch_date DATE,
  actual_hatch_date DATE,
  egg_count INTEGER DEFAULT 0,
  hatched_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('preparing', 'laying', 'incubating', 'hatching', 'completed', 'abandoned')) DEFAULT 'preparing',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create eggs table
CREATE TABLE eggs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nest_id UUID REFERENCES nests(id) ON DELETE CASCADE NOT NULL,
  lay_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('laid', 'fertile', 'infertile', 'hatched', 'dead')) DEFAULT 'laid',
  hatch_date DATE,
  bird_id UUID REFERENCES birds(id) ON DELETE SET NULL, -- If hatched, reference to the bird
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_records table
CREATE TABLE health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bird_id UUID REFERENCES birds(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT CHECK (type IN ('vaccination', 'medication', 'checkup', 'other')) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_birds_user_id ON birds(user_id);
CREATE INDEX idx_birds_aviary_id ON birds(aviary_id);
CREATE INDEX idx_birds_father_id ON birds(father_id);
CREATE INDEX idx_birds_mother_id ON birds(mother_id);
CREATE INDEX idx_couples_user_id ON couples(user_id);
CREATE INDEX idx_couples_male_bird_id ON couples(male_bird_id);
CREATE INDEX idx_couples_female_bird_id ON couples(female_bird_id);
CREATE INDEX idx_nests_user_id ON nests(user_id);
CREATE INDEX idx_nests_couple_id ON nests(couple_id);
CREATE INDEX idx_nests_aviary_id ON nests(aviary_id);
CREATE INDEX idx_eggs_user_id ON eggs(user_id);
CREATE INDEX idx_eggs_nest_id ON eggs(nest_id);
CREATE INDEX idx_eggs_bird_id ON eggs(bird_id);
CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_health_records_bird_id ON health_records(bird_id);
CREATE INDEX idx_aviaries_user_id ON aviaries(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE birds ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE nests ENABLE ROW LEVEL SECURITY;
ALTER TABLE eggs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Birds policies
CREATE POLICY "Users can view own birds" ON birds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own birds" ON birds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own birds" ON birds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own birds" ON birds FOR DELETE USING (auth.uid() = user_id);

-- Couples policies
CREATE POLICY "Users can view own couples" ON couples FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own couples" ON couples FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own couples" ON couples FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own couples" ON couples FOR DELETE USING (auth.uid() = user_id);

-- Aviaries policies
CREATE POLICY "Users can view own aviaries" ON aviaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own aviaries" ON aviaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own aviaries" ON aviaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own aviaries" ON aviaries FOR DELETE USING (auth.uid() = user_id);

-- Nests policies
CREATE POLICY "Users can view own nests" ON nests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nests" ON nests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nests" ON nests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nests" ON nests FOR DELETE USING (auth.uid() = user_id);

-- Eggs policies
CREATE POLICY "Users can view own eggs" ON eggs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own eggs" ON eggs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own eggs" ON eggs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own eggs" ON eggs FOR DELETE USING (auth.uid() = user_id);

-- Health records policies
CREATE POLICY "Users can view own health records" ON health_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health records" ON health_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health records" ON health_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health records" ON health_records FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
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
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return NEW
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER birds_updated_at BEFORE UPDATE ON birds FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER couples_updated_at BEFORE UPDATE ON couples FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER aviaries_updated_at BEFORE UPDATE ON aviaries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER nests_updated_at BEFORE UPDATE ON nests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER eggs_updated_at BEFORE UPDATE ON eggs FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create some useful views for complex queries

-- View for birds with their parents' names
CREATE OR REPLACE VIEW birds_with_parents AS
SELECT 
  b.*,
  f.name as father_name,
  m.name as mother_name,
  a.name as aviary_name
FROM birds b
LEFT JOIN birds f ON b.father_id = f.id
LEFT JOIN birds m ON b.mother_id = m.id
LEFT JOIN aviaries a ON b.aviary_id = a.id;

-- View for couples with bird names
CREATE OR REPLACE VIEW couples_with_birds AS
SELECT 
  c.*,
  mb.name as male_name,
  mb.species as male_species,
  fb.name as female_name,
  fb.species as female_species
FROM couples c
JOIN birds mb ON c.male_bird_id = mb.id
JOIN birds fb ON c.female_bird_id = fb.id;

-- View for nests with couple and aviary information
CREATE OR REPLACE VIEW nests_with_details AS
SELECT 
  n.*,
  c.male_bird_id,
  c.female_bird_id,
  mb.name as male_name,
  fb.name as female_name,
  a.name as aviary_name
FROM nests n
JOIN couples c ON n.couple_id = c.id
JOIN birds mb ON c.male_bird_id = mb.id
JOIN birds fb ON c.female_bird_id = fb.id
LEFT JOIN aviaries a ON n.aviary_id = a.id;

-- Grant permissions on views
GRANT SELECT ON birds_with_parents TO authenticated;
GRANT SELECT ON couples_with_birds TO authenticated;
GRANT SELECT ON nests_with_details TO authenticated;

-- Enable RLS on views
ALTER VIEW birds_with_parents ENABLE ROW LEVEL SECURITY;
ALTER VIEW couples_with_birds ENABLE ROW LEVEL SECURITY;
ALTER VIEW nests_with_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for views
CREATE POLICY "Users can view own birds with parents" ON birds_with_parents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own couples with birds" ON couples_with_birds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own nests with details" ON nests_with_details FOR SELECT USING (auth.uid() = user_id);

-- Final verification queries (these will show if everything was created successfully)
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'birds', 'couples', 'aviaries', 'nests', 'eggs', 'health_records');