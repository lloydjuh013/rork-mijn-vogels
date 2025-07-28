# MyBird.app - Complete Troubleshooting Guide

## 🚨 Current Issues
1. **Account Creation & Login Problems**
2. **Email Configuration Issues** (emails not from info@mybird.app)
3. **Profile Creation Errors**

## 🔧 Step-by-Step Solutions

### 1. Database & Authentication Diagnostics

#### Run Diagnostics Script
```typescript
import { runSupabaseDiagnostics, checkSupabaseConfiguration } from '@/utils/supabase-diagnostics';

// Check configuration
checkSupabaseConfiguration();

// Run full diagnostics
runSupabaseDiagnostics();
```

#### Manual Database Verification
1. **Go to Supabase Dashboard** → https://supabase.com/dashboard
2. **Select your project** → ywzoxzkwakmiaykbkevk
3. **Check Tables**:
   - Go to "Table Editor"
   - Verify these tables exist: `profiles`, `birds`, `couples`, `aviaries`, `nests`
   - Check if `profiles` table has correct structure

#### Verify Database Schema
```sql
-- Run in Supabase SQL Editor
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'birds', 'couples', 'aviaries', 'nests')
ORDER BY table_name, ordinal_position;
```

### 2. Fix Email Configuration

#### Current Problem
- Emails are NOT coming from `info@mybird.app`
- Users receive emails from wrong sender

#### Solution Steps

1. **Configure Custom SMTP in Supabase**:
   - Go to Supabase Dashboard → Authentication → Settings
   - Scroll to "SMTP Settings"
   - Enable "Enable custom SMTP"

2. **SMTP Configuration for info@mybird.app**:
   ```
   SMTP Host: [Your email provider's SMTP server]
   SMTP Port: 587 (or 465 for SSL)
   SMTP Username: info@mybird.app
   SMTP Password: [Your email password/app password]
   Sender Email: info@mybird.app
   Sender Name: MyBird App
   ```

3. **Popular Email Providers**:

   **Gmail/Google Workspace**:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: info@mybird.app
   Password: [App Password - not regular password]
   ```

   **Outlook/Office365**:
   ```
   Host: smtp-mail.outlook.com
   Port: 587
   Username: info@mybird.app
   Password: [Your password]
   ```

   **Custom Domain (cPanel/WHM)**:
   ```
   Host: mail.mybird.app (or your hosting provider's SMTP)
   Port: 587
   Username: info@mybird.app
   Password: [Email password]
   ```

4. **Test Email Configuration**:
   ```typescript
   import { testEmailConfiguration } from '@/utils/supabase-diagnostics';
   
   // Test with your email
   testEmailConfiguration('your-test-email@gmail.com');
   ```

### 3. Fix Authentication Issues

#### Problem: Rate Limiting Errors
```
"For security purposes, you can only request this after 50 seconds"
```

**Solution**:
1. **Wait 60 seconds** between registration attempts
2. **Clear browser cache/storage**
3. **Use different email** for testing
4. **Check Supabase Auth Rate Limits**:
   - Dashboard → Authentication → Settings
   - Adjust rate limiting if needed

#### Problem: Profile Creation Errors
```
"Error creating profile: [object Object]"
```

**Solution - Fix Database Trigger**:
```sql
-- Run in Supabase SQL Editor
-- 1. Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Recreate the trigger if needed
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
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Fix Row Level Security

#### Verify RLS Policies
```sql
-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- If policies are missing, recreate them:
-- (Run the complete supabase-setup.sql again)
```

### 5. Environment Variables Check

#### Verify .env file
```bash
# Check your .env file contains:
EXPO_PUBLIC_SUPABASE_URL=https://ywzoxzkwakmiaykbkevk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Test Environment Loading
```typescript
// Add to your app for debugging
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
```

### 6. Complete Reset Procedure

If all else fails, follow this complete reset:

1. **Clear All Local Data**:
   ```typescript
   // Clear AsyncStorage
   import AsyncStorage from '@react-native-async-storage/async-storage';
   AsyncStorage.clear();
   
   // Clear React Query cache
   queryClient.clear();
   ```

2. **Reset Supabase Auth**:
   ```sql
   -- CAREFUL: This deletes all users!
   DELETE FROM auth.users WHERE email LIKE '%test%';
   ```

3. **Recreate Database**:
   - Run the complete `supabase-setup.sql` script again

4. **Test Registration Flow**:
   - Use a fresh email address
   - Monitor console logs
   - Check Supabase Dashboard → Authentication → Users

### 7. Monitoring & Debugging

#### Enable Detailed Logging
```typescript
// Add to your auth-store.ts
const DEBUG_AUTH = true;

if (DEBUG_AUTH) {
  console.log('Auth Debug - Registration Data:', data);
  console.log('Auth Debug - Supabase Response:', authData);
  console.log('Auth Debug - Profile Creation:', profile);
}
```

#### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Filter by "Auth" and "Database"
4. Look for errors during registration

### 8. Email Template Customization

#### Customize Email Templates
1. **Supabase Dashboard** → Authentication → Email Templates
2. **Confirm Signup Template**:
   ```html
   <h2>Welkom bij MyBird!</h2>
   <p>Klik op de link om je account te bevestigen:</p>
   <a href="{{ .ConfirmationURL }}">Account Bevestigen</a>
   ```

3. **Reset Password Template**:
   ```html
   <h2>Wachtwoord Resetten - MyBird</h2>
   <p>Klik op de link om je wachtwoord te resetten:</p>
   <a href="{{ .ConfirmationURL }}">Wachtwoord Resetten</a>
   ```

### 9. Production Checklist

Before going live:
- [ ] Custom SMTP configured with info@mybird.app
- [ ] Email templates customized
- [ ] Rate limiting configured appropriately
- [ ] Database triggers working
- [ ] RLS policies active
- [ ] All environment variables set
- [ ] Error handling implemented
- [ ] Logging configured

### 10. Emergency Contacts

If issues persist:
- **Supabase Support**: https://supabase.com/support
- **Email Provider Support**: Contact your email hosting provider
- **Domain Support**: Contact your domain registrar

## 🔍 Quick Diagnostic Commands

```typescript
// Run these in your app console for quick checks:

// 1. Check environment
console.log('ENV Check:', {
  url: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
  key: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
});

// 2. Test connection
supabase.from('profiles').select('count', { count: 'exact', head: true })
  .then(({ data, error }) => console.log('Connection:', error ? 'Failed' : 'Success'));

// 3. Check auth state
supabase.auth.getUser()
  .then(({ data, error }) => console.log('Auth:', data.user ? 'Logged in' : 'Not logged in'));
```

This guide should resolve all authentication and email issues. Follow the steps in order and test after each major change.