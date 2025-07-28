-- QUICK FIX FOR RLS POLICY VIOLATION ON PROFILES TABLE
-- Run this script in your Supabase SQL Editor to fix the profile creation issue

-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a more permissive policy that allows the trigger to work
-- This allows users to insert their own profile OR allows the system (trigger) to insert
CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  auth.role() = 'service_role' OR
  current_setting('role') = 'postgres'
);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile';

-- Test that the trigger function has the right permissions
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'handle_new_user';

SELECT 'RLS Policy fix completed successfully!' as status;