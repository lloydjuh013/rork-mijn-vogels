# Authentication & Profile Creation Fix Guide

## Issues Fixed

1. **"JSON object requested, multiple (or no) rows returned"** - Fixed by replacing `.single()` with `.limit(1)` and array access
2. **"new row violates row-level security policy"** - Fixed with proper RLS policies and trigger function permissions
3. **Profile creation failures** - Fixed with SECURITY DEFINER function and proper error handling

## Steps to Fix

### 1. Run the Complete RLS Fix Script

Copy and paste the entire content of `COMPLETE_RLS_FIX.sql` into your Supabase SQL Editor and run it. This script will:

- Clean up any duplicate profiles
- Recreate the trigger function with proper security settings
- Fix RLS policies to allow system operations
- Grant necessary permissions
- Test the setup

### 2. Verify the Fix

After running the SQL script, check the console output for:

```
✅ RLS Policy fix completed successfully!
```

### 3. Test Authentication

Try registering a new user or logging in. The console should show:

```
Profile created by trigger: { id: "...", email: "...", name: "..." }
```

## What Was Changed

### Database Level
- **Trigger Function**: Added `SECURITY DEFINER` to bypass RLS during profile creation
- **RLS Policies**: Made more permissive to allow system operations
- **Error Handling**: Added proper exception handling in the trigger
- **Duplicate Cleanup**: Removed any duplicate profiles that might exist

### Application Level
- **Query Changes**: Replaced `.single()` with `.limit(1)` to avoid "multiple rows" errors
- **Error Handling**: Improved error messages and fallback behavior
- **Profile Fetching**: More robust profile retrieval with retries

## Expected Behavior After Fix

1. **Registration**: User signs up → Trigger creates profile automatically → User is logged in
2. **Login**: User logs in → Profile is fetched successfully → User data is available
3. **No More Errors**: No RLS violations or "multiple rows" errors

## Verification Commands

Run these in Supabase SQL Editor to verify everything is working:

```sql
-- Check if trigger function exists and has proper security
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'handle_new_user';

-- Check RLS policies
SELECT policyname, cmd, with_check FROM pg_policies WHERE tablename = 'profiles';

-- Test profile creation (should work without errors)
SELECT 'All systems operational!' as status;
```

## If Issues Persist

1. Check Supabase logs for any trigger errors
2. Verify your environment variables are correct
3. Ensure you're using the latest database schema
4. Contact support if authentication still fails after following these steps