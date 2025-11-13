# Fix: Invalid Supabase API Key Error

## Problem

You're seeing an "Invalid API Key" error when trying to sign in or sign up. This happens because the hardcoded Supabase credentials in the app are either:
- From a test/example project that doesn't exist
- From a paused or deleted Supabase project
- Incorrect or expired

## Solution: Update Your Supabase Credentials

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard:**
   - Visit: https://app.supabase.com/
   - Sign in with your account

2. **Select or Create a Project:**
   - If you already have a project for this app, select it
   - If not, click "New Project" and create one:
     - Name: "Flow Focus" or "ADHD Timer"
     - Database Password: Choose a strong password (save it!)
     - Region: Choose closest to your users
     - Click "Create new project" (wait 2-3 minutes for setup)

3. **Get Your API Credentials:**
   - Once your project is ready, go to: **Settings** → **API**
   - You'll see:
     - **Project URL**: Something like `https://xxxxx.supabase.co`
     - **anon public**: A long JWT token starting with `eyJ...`

4. **Copy Both Values** - You'll need them in the next step!

### Step 2: Update the App Configuration

You have **two options** to fix this:

#### **Option A: Update environment.ts (Quick Fix)**

Edit `app/config/environment.ts` and replace lines 22-23 with your actual credentials:

```typescript
// Use actual Supabase credentials for this project
const actualSupabaseUrl = supabaseUrl || 'https://YOUR-PROJECT-REF.supabase.co';
const actualSupabaseAnonKey = supabaseAnonKey || 'YOUR-ACTUAL-ANON-KEY-HERE';
```

**Replace:**
- `YOUR-PROJECT-REF` with your project reference (the part before `.supabase.co`)
- `YOUR-ACTUAL-ANON-KEY-HERE` with your full anon public key

#### **Option B: Use Environment Variables (Recommended)**

1. **Create a `.env` file** in the project root:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **The app will automatically use these** instead of the hardcoded values!

### Step 3: Enable Email Authentication in Supabase

1. In your Supabase Dashboard, go to: **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **ENABLED**
4. Configuration options:
   - **Confirm email**: Toggle ON if you want email confirmation (recommended)
   - **Secure email change**: Toggle ON (recommended)

### Step 4: Set Up Email Templates (Optional but Recommended)

Go to **Authentication** → **Email Templates** and customize:
- Confirmation email
- Reset password email
- Magic link email

### Step 5: Restart Your App

```bash
# Stop the current dev server (Ctrl+C)
# Clear Metro cache and restart
npx expo start --clear
```

### Step 6: Test Authentication

1. **Create a new account:**
   - Open your app in Expo Go
   - Go to Sign Up
   - Enter your email (ezequielcasillas1@gmail.com) and password
   - Submit

2. **Check your email** (if email confirmation is enabled):
   - Look for the confirmation email from Supabase
   - Click the confirmation link
   - Return to the app and sign in

3. **Sign in:**
   - Use your email and password
   - Should work without "Invalid API Key" error!

## Verify It's Working

You'll know it's working when:
- ✅ The console shows your actual Supabase URL (not `brwhhkmjyadcaasqggtd`)
- ✅ Sign up creates a user in Supabase Dashboard → Authentication → Users
- ✅ Sign in successfully authenticates and navigates to the home screen
- ✅ No "Invalid API Key" errors

## Common Issues

### Issue: Still getting "Invalid API Key"
**Solution:** 
- Make sure you copied the **anon public** key, not the service_role key
- Check there are no extra spaces in the key
- Verify the URL format is correct: `https://xxxxx.supabase.co` (no trailing slash)

### Issue: "Email not confirmed" error
**Solution:**
- Check your email (including spam folder)
- Or temporarily disable email confirmation in Supabase → Authentication → Settings

### Issue: Changes not reflecting
**Solution:**
- Stop the dev server completely
- Run: `npx expo start --clear`
- Reload the app in Expo Go

## Security Note

**IMPORTANT:** If you create a `.env` file, it's already in `.gitignore` and won't be committed to Git. This is good! Never commit your API keys to version control.

For production builds with EAS, set environment variables in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxxxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-key-here"
      }
    }
  }
}
```

## Need More Help?

If you're still having issues:
1. Check the Expo dev tools console for detailed error messages
2. Verify your Supabase project is not paused (free tier pauses after 7 days of inactivity)
3. Make sure you're using the correct credentials from the right project


