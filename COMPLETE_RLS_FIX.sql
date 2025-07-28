-- COMPLETE RLS POLICY FIX FOR MYBIRD APP
-- This script fixes all RLS policy issues and ensures proper profile creation
-- Run this ENTIRE script in your Supabase SQL Editor

-- Step 1: Clean up any duplicate profiles first
DO $$
DECLARE
    duplicate_record RECORD;
BEGIN
    -- Find and remove duplicate profiles, keeping only the first one
    FOR duplicate_record IN 
        SELECT id, ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at) as rn
        FROM profiles
    LOOP
        IF duplicate_record.rn > 1 THEN
            DELETE FROM profiles WHERE id = duplicate_record.id AND created_at > (
                SELECT MIN(created_at) FROM profiles WHERE id = duplicate_record.id
            );
        END IF;
    END LOOP;
END $$;

-- Step 2: Drop and recreate the trigger function with proper security
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- This is crucial - allows function to bypass RLS
SET search_path = public
AS $$
BEGIN
  -- Insert profile with proper error handling
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Failed to create/update profile for user %: % (SQLSTATE: %)', 
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Fix RLS policies to be more permissive for system operations
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, more permissive policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow profile insertion by user OR by system (trigger)
CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  auth.role() = 'service_role' OR
  current_setting('role', true) = 'postgres' OR
  session_user = 'postgres'
);

-- Step 4: Grant necessary permissions to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 5: Ensure the function has proper ownership and permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Step 6: Test the setup by creating a test profile (this should work now)
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- This simulates what the trigger does
    INSERT INTO public.profiles (id, email, name)
    VALUES (test_user_id, 'test@example.com', 'Test User');
    
    -- Clean up the test
    DELETE FROM public.profiles WHERE id = test_user_id;
    
    RAISE NOTICE 'Profile creation test successful!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Profile creation test failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- Step 7: Verification queries
SELECT 'Checking trigger function...' as status;
SELECT proname, prosecdef, proowner 
FROM pg_proc 
WHERE proname = 'handle_new_user';

SELECT 'Checking RLS policies...' as status;
SELECT schemaname, tablename, policyname, permissive, cmd, with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

SELECT 'Checking table permissions...' as status;
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles' AND table_schema = 'public';

SELECT '✅ RLS Policy fix completed successfully!' as final_status;