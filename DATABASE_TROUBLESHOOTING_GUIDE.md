# Database Setup & Troubleshooting Guide

## Step 1: Run the Complete Database Setup

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Complete Setup**
   - Open the file `COMPLETE_DATABASE_SETUP.sql` in this project
   - Copy the ENTIRE contents
   - Paste it into the Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify Success**
   - You should see "Tables created successfully" at the bottom
   - Check that all tables are listed: profiles, birds, couples, aviaries, nests, eggs, health_records

## Step 2: Verify Your Environment Variables

Make sure your `.env` file has the correct values:

```
EXPO_PUBLIC_SUPABASE_URL=https://ywzoxzkwakmiaykbkevk.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your_anon_key_here
```

**To find your keys:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "Project URL" for EXPO_PUBLIC_SUPABASE_URL
3. Copy the "anon public" key for EXPO_PUBLIC_SUPABASE_KEY

## Step 3: Test the Setup

After running the SQL script:

1. **Try to register a new user**
   - The profile should be created automatically
   - No more "profile creation" errors

2. **Check if data loads**
   - Birds, couples, aviaries, and nests should load without errors
   - Even if empty, they should not show "table does not exist" errors

## Common Issues & Solutions

### Issue: "relation does not exist" errors
**Solution:** The database tables weren't created. Run the complete SQL setup script.

### Issue: "Could not find a relationship" errors
**Solution:** The foreign key relationships weren't set up properly. The SQL script fixes this.

### Issue: Profile creation errors
**Solution:** The trigger function wasn't created or has errors. The SQL script includes an improved trigger with error handling.

### Issue: Empty error objects `{}`
**Solution:** This was due to missing tables. After running the SQL script, you'll get proper error messages if any issues occur.

## Verification Queries

After running the setup, you can run these queries in Supabase SQL Editor to verify everything works:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'birds', 'couples', 'aviaries', 'nests', 'eggs', 'health_records');

-- Check if triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Check if RLS policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## What the SQL Script Does

1. **Drops existing tables** (if any) to start fresh
2. **Creates all tables** with proper relationships
3. **Sets up Row Level Security** policies
4. **Creates indexes** for better performance
5. **Creates triggers** for automatic profile creation and timestamp updates
6. **Creates views** for complex queries
7. **Grants proper permissions**

## After Setup

Once you run the SQL script:
- All database errors should be resolved
- User registration should work properly
- Data fetching should work (even if returning empty arrays)
- The app should function normally

If you still see errors after running the SQL script, please share the specific error messages - they should now be more descriptive and helpful for debugging.