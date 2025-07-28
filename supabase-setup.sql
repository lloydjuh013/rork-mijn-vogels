-- MyBird App - Supabase Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create birds table
CREATE TABLE IF NOT EXISTS birds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
  birth_date DATE,
  ring_number TEXT,
  color TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  male_bird_id UUID REFERENCES birds(id) ON DELETE CASCADE NOT NULL,
  female_bird_id UUID REFERENCES birds(id) ON DELETE CASCADE NOT NULL,
  pair_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'separated')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create aviaries table
CREATE TABLE IF NOT EXISTS aviaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nests table
CREATE TABLE IF NOT EXISTS nests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  aviary_id UUID REFERENCES aviaries(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  expected_hatch_date DATE,
  actual_hatch_date DATE,
  egg_count INTEGER DEFAULT 0,
  hatched_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('preparing', 'laying', 'incubating', 'hatching', 'completed', 'abandoned')) DEFAULT 'preparing',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE birds ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE nests ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_birds_user_id ON birds(user_id);
CREATE INDEX IF NOT EXISTS idx_couples_user_id ON couples(user_id);
CREATE INDEX IF NOT EXISTS idx_aviaries_user_id ON aviaries(user_id);
CREATE INDEX IF NOT EXISTS idx_nests_user_id ON nests(user_id);
CREATE INDEX IF NOT EXISTS idx_nests_couple_id ON nests(couple_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_birds
  BEFORE UPDATE ON birds
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_couples
  BEFORE UPDATE ON couples
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_aviaries
  BEFORE UPDATE ON aviaries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_nests
  BEFORE UPDATE ON nests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();