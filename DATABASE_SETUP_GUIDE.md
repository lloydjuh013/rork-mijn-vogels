# 🐦 MyBird App - Complete Database Setup Guide

## 🚨 CRITICAL: Follow These Steps Exactly

Your app is currently showing errors because the database tables don't exist yet. Follow these steps to fix all issues:

## Step 1: Run the Database Setup Script

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `ywzoxzkwakmiaykbkevk`

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Complete Script**
   - Open the file `COMPLETE_WORKING_DATABASE_SETUP.sql` in your project
   - Copy the ENTIRE contents (all 200+ lines)
   - Paste it into the SQL Editor

4. **Run the Script**
   - Click the "Run" button (or press Ctrl/Cmd + Enter)
   - Wait for it to complete
   - You should see "Database setup completed successfully!" at the bottom

## Step 2: Verify the Setup

1. **Check Tables Were Created**
   - In Supabase Dashboard, go to "Table Editor"
   - You should see these tables:
     - ✅ profiles
     - ✅ birds  
     - ✅ couples
     - ✅ aviaries
     - ✅ nests
     - ✅ eggs
     - ✅ health_records

2. **Test in Your App**
   - Go to your app
   - Navigate to `/diagnostics` (add this to your URL)
   - Click "Run Database Diagnostics"
   - All items should show ✅ green checkmarks

## Step 3: Test User Registration

1. **Try Creating an Account**
   - Go to the registration page in your app
   - Create a new account with a valid email
   - The profile should be created automatically

2. **Check Profile Creation**
   - In Supabase Dashboard → Table Editor → profiles
   - You should see your new user profile

## 🔧 Troubleshooting

### If you see "relation does not exist" errors:
- The database script hasn't been run yet
- Go back to Step 1 and run the complete SQL script

### If you see "could not find relationship" errors:
- The foreign key relationships weren't created properly
- Re-run the complete SQL script (it will drop and recreate everything)

### If profile creation fails:
- Check the `handle_new_user()` function was created
- Check the trigger `on_auth_user_created` exists
- Look in Supabase Dashboard → Database → Functions

### If authentication fails:
- Verify your `.env` file has the correct keys:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://ywzoxzkwakmiaykbkevk.supabase.co
  EXPO_PUBLIC_SUPABASE_KEY=your-anon-key-here
  ```

## 📧 Email Configuration (Optional)

If you want emails to come from `info@mybird.app`:

1. **Go to Supabase Dashboard → Authentication → Settings**
2. **Scroll to "SMTP Settings"**
3. **Configure your email provider** (Gmail, SendGrid, etc.)
4. **Set the "From Email" to `info@mybird.app`**
5. **Verify your domain** if required by your email provider

## ✅ Success Checklist

- [ ] SQL script ran without errors
- [ ] All 7 tables exist in Supabase
- [ ] Diagnostics page shows all green checkmarks
- [ ] Can register new users successfully
- [ ] Can login with existing users
- [ ] App loads without database errors

## 🆘 Still Having Issues?

If you're still seeing errors after following this guide:

1. **Check the browser console** for detailed error messages
2. **Run the diagnostics** at `/diagnostics` in your app
3. **Verify environment variables** are correct in `.env`
4. **Re-run the SQL script** - it's safe to run multiple times

The most common issue is simply that the SQL script hasn't been run yet. Make sure you've completed Step 1 first!