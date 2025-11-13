# Email/Password Authentication Testing Guide

## Quick Start Testing

After setting up your `.env` file with Supabase credentials, follow these steps to test email/password authentication.

---

## **Step 1: Restart with Clean Cache**

```bash
# Stop the current server (Ctrl+C)
npx expo start --clear
```

This ensures your new environment variables are loaded.

---

## **Step 2: Verify Environment Variables Loaded**

Look at the terminal output when the app starts. You should see:

```
LOG  Environment configuration: {
  "supabaseUrl": "https://your-actual-project.supabase.co",
  "hasAnonKey": true,
  "isDevelopment": true
}
```

✅ **Good:** Your actual Supabase URL shows
❌ **Bad:** Still shows `brwhhkmjyadcaasqggtd` → Environment variables not loaded

If showing the wrong URL:
- Verify `.env` file is in project root
- Check variable names exactly match: `EXPO_PUBLIC_SUPABASE_URL`
- Restart the dev server again

---

## **Step 3: Test Sign Up Flow**

### A. Create a New Account

1. **Open app in Expo Go**
2. **Tap "Sign Up" or "Create Account"**
3. **Fill in the form:**
   ```
   Name: Your Name
   Email: youremail@gmail.com
   Password: YourPassword123!
   Confirm Password: YourPassword123!
   ```
4. **Tap "Create Account"**

### B. Expected Results

**Success Path:**
- ✅ Alert appears: "Check Your Email! 📧"
- ✅ Message says verification link sent to your email
- ✅ Form shows success banner
- ✅ "Resend Confirmation Email" button appears

**Error Path (if Supabase not configured):**
- ❌ "Invalid API Key" → Your credentials are still wrong
- ❌ "User already registered" → You already created this account
- ❌ "Email not authorized" → Email confirmation is restricted

---

## **Step 4: Confirm Your Email**

### A. Check Your Email

1. **Look for email** from your Supabase project
   - Subject: "Confirm your signup"
   - Sender: noreply@mail.app.supabase.io
2. **Check spam folder** if not in inbox
3. **Click the confirmation link**

### B. Email Settings in Supabase

If no email arrives:

1. **Go to Supabase Dashboard** → Your Project
2. **Navigate to:** Authentication → Settings → Email Auth
3. **Check these settings:**
   - ✅ **Enable Email Confirmations:** Should be ON (default)
   - ✅ **Confirmation URL:** Should be set (or use default)
   - ✅ **Email Provider:** Using Supabase SMTP (default) or your own

### C. Temporary Fix: Disable Email Confirmation

For testing only, you can disable email confirmation:

1. **Supabase Dashboard** → Authentication → Settings
2. **Find:** "Enable email confirmations"
3. **Toggle OFF** (testing only!)
4. **Save changes**
5. **Try signing up again** - should auto-login without email confirmation

**Remember to turn it back ON for production!**

---

## **Step 5: Test Sign In**

### A. After Email Confirmation

1. **Return to the app**
2. **Go to Sign In screen** (if not already there)
3. **Enter your credentials:**
   ```
   Email: youremail@gmail.com
   Password: YourPassword123!
   ```
4. **Tap "Sign In"**

### B. Expected Results

**Success:**
- ✅ Short delay (loading indicator)
- ✅ Console shows: "SignIn: Authentication successful"
- ✅ Navigates to home/tabs screen
- ✅ You're logged in!

**Common Errors:**
- ❌ "Invalid Credentials" → Wrong email or password
- ❌ "Email not confirmed" → Click email confirmation link first
- ❌ "Invalid API Key" → Supabase credentials still wrong

---

## **Step 6: Verify in Supabase Dashboard**

Check if the sign-in was recorded:

1. **Supabase Dashboard** → Authentication → Users
2. **Find your user** in the list
3. **Check columns:**
   - ✅ Email Confirmed: Should be ✓ (green check)
   - ✅ Last Sign In: Should show recent timestamp
   - ✅ Created At: When you signed up

---

## **Common Issues & Solutions**

### Issue: "Invalid API Key"

**Root Cause:** Supabase credentials are wrong or not loaded.

**Solution:**
1. Verify `.env` file contents:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```
2. Check the URL format (no trailing slash)
3. Check the key is the **anon public** key
4. Restart: `npx expo start --clear`

### Issue: "Email not confirmed"

**Root Cause:** You haven't clicked the email confirmation link.

**Solution:**
1. Check your email (including spam)
2. Click the confirmation link
3. Return to app and try signing in again

**Alternative:** Use the "Resend Confirmation Email" button

### Issue: No email received

**Possible Causes:**
- Email confirmation is disabled
- Email went to spam
- Supabase email quota exceeded (free tier: 3 emails/hour)
- Wrong email address entered

**Solutions:**
1. Check spam folder
2. Wait a few minutes and try again
3. Temporarily disable email confirmation in Supabase
4. Check Supabase logs for email delivery issues

### Issue: "User already registered"

**Root Cause:** An account with this email already exists.

**Solutions:**
- Use the "Sign In" screen instead
- Use "Forgot Password" to reset if you forgot it
- Use a different email address
- Delete the user from Supabase Dashboard → Authentication → Users

### Issue: Still shows old Supabase URL

**Root Cause:** Metro cache not cleared or `.env` not loaded.

**Solution:**
```bash
# Stop the server
Ctrl+C

# Clear all caches
npx expo start --clear

# If still not working, try:
rm -rf node_modules/.cache
npx expo start --clear
```

### Issue: Changes not reflecting

**Solution:**
1. **Full reload in Expo Go:**
   - Shake device
   - Tap "Reload"
2. **Or restart dev server:**
   ```bash
   npx expo start --clear
   ```

---

## **Testing Checklist**

Use this checklist to verify everything works:

### Environment Setup
- [ ] `.env` file created in project root
- [ ] Contains `EXPO_PUBLIC_SUPABASE_URL`
- [ ] Contains `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Dev server restarted with `--clear` flag
- [ ] Console shows correct Supabase URL (not `brwhhkmjyadcaasqggtd`)

### Sign Up Flow
- [ ] Sign up screen loads without errors
- [ ] Can enter name, email, password
- [ ] Form validation works (shows errors for invalid inputs)
- [ ] Tapping "Create Account" shows loading state
- [ ] Success message appears
- [ ] Confirmation email arrives (or disabled for testing)

### Email Confirmation
- [ ] Email received in inbox or spam
- [ ] Confirmation link works when clicked
- [ ] Redirects to success page or app

### Sign In Flow
- [ ] Sign in screen loads without errors
- [ ] Can enter email and password
- [ ] Tapping "Sign In" shows loading state
- [ ] Successfully authenticates
- [ ] Navigates to home/tabs screen
- [ ] User remains logged in after app restart

### Supabase Dashboard
- [ ] User appears in Authentication → Users
- [ ] Email is confirmed (✓)
- [ ] Last sign in timestamp is recent

---

## **Next Steps After Successful Auth**

Once email/password authentication works:

1. ✅ **Test Sign Out:**
   - Go to Settings or Profile
   - Tap "Sign Out"
   - Should return to welcome/sign-in screen

2. ✅ **Test Password Reset:**
   - Go to Sign In screen
   - Tap "Forgot Password"
   - Enter email and submit
   - Check email for reset link

3. ✅ **Test Session Persistence:**
   - Sign in
   - Close the app completely
   - Reopen the app
   - Should still be signed in

4. ✅ **Prepare for Production:**
   - Re-enable email confirmation if you disabled it
   - Customize email templates in Supabase
   - Set up proper email sending (not Supabase default SMTP)
   - Add password strength requirements

---

## **Security Reminders**

- 🔒 Never commit `.env` file to Git
- 🔒 Use different Supabase projects for dev/production
- 🔒 Enable Row Level Security (RLS) in Supabase
- 🔒 Regularly rotate API keys
- 🔒 Enable email confirmation for production

---

## **Support**

If you're still having issues:
1. Check the Metro bundler console for errors
2. Check the Supabase logs (Dashboard → Logs)
3. Verify your Supabase project is active (not paused)
4. See: `docs/SUPABASE_SETUP_FIX.md` for more help


