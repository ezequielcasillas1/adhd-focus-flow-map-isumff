# Google Client ID Setup Guide

## Overview

This guide shows you how to properly configure your Google OAuth Client ID for both local development (Expo Go/dev server) and production builds (EAS).

---

## **Prerequisites**

1. A Google Cloud Console project
2. OAuth consent screen configured
3. OAuth 2.0 Web Client ID created

If you haven't set these up yet, see: `docs/GOOGLE_OAUTH_SETUP.md`

---

## **Step 1: Get Your Web Client ID**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to Credentials:**
   - Go to: **APIs & Services** → **Credentials**

3. **Find Your Web Client ID:**
   - Look for an OAuth 2.0 Client ID with type "Web application"
   - Click on it to view details
   - **Copy the Client ID** - format: `xxxxx-xxxxx.apps.googleusercontent.com`

**Important:** Use the **Web Client ID**, NOT:
- ❌ Android Client ID
- ❌ iOS Client ID
- ❌ Service Account

---

## **Step 2: Configure for Local Development**

### **Option A: Using .env File (Recommended)**

1. **Create `.env` file** in your project root (if it doesn't exist):

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth Web Client ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

2. **The `.env` file is already in `.gitignore`** - it won't be committed to Git ✅

### **Option B: Update environment.ts Directly**

Edit `app/config/environment.ts` line 19:

```typescript
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
  Constants.expoConfig?.extra?.googleWebClientId || 
  'YOUR-CLIENT-ID.apps.googleusercontent.com';  // Add your Client ID here
```

**Note:** Option A (`.env`) is better for security!

---

## **Step 3: Configure for EAS Builds**

You have **two options**:

### **Option A: Using EAS Secrets (Most Secure)**

Run in your terminal:

```bash
# Create the secret
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "your-client-id.apps.googleusercontent.com"

# Verify it was created
eas secret:list
```

**Pros:**
- ✅ Most secure - not stored in code
- ✅ Can be different per environment
- ✅ Easy to rotate/update

### **Option B: Add to eas.json Directly**

Edit `eas.json` and add your credentials to each build profile:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "autoIncrement": true,
      "env": {
        "NODE_ENV": "staging",
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "your-client-id.apps.googleusercontent.com"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "NODE_ENV": "production",
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "your-client-id.apps.googleusercontent.com"
      }
    }
  }
}
```

**Note:** If using this option, be careful not to commit sensitive keys to public repos!

---

## **Step 4: Enable Google Sign-in Code**

Remember, we **disabled Google Sign-in for Expo Go compatibility**. To re-enable it for EAS builds:

### **1. Uncomment Imports in sign-in.tsx:**

Edit `app/(auth)/sign-in.tsx` lines 20-26:

Change this:
```typescript
// Google Sign-in temporarily disabled for Expo Go compatibility
// Uncomment when building with EAS or using expo-dev-client:
// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from '@react-native-google-signin/google-signin';
```

To this:
```typescript
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
```

### **2. Do the same in sign-up.tsx:**

Edit `app/(auth)/sign-up.tsx` lines 20-26 (same change as above)

### **3. Re-enable Google Sign-in Plugin:**

Edit `app.json` and add the plugin back:

```json
"plugins": [
  "expo-font",
  "expo-router",
  "expo-web-browser",
  [
    "@react-native-google-signin/google-signin"
  ]
]
```

---

## **Step 5: Configure Supabase**

In your Supabase Dashboard:

1. **Go to:** Authentication → Providers
2. **Find:** Google
3. **Enable** the Google provider
4. **Add your Client ID** from Google Cloud Console
5. **Add your Client Secret** from Google Cloud Console
6. **Copy the callback URL** and add it to your Google Cloud Console OAuth settings

---

## **Step 6: Test Your Setup**

### **For Local Development (Expo Go):**

**Note:** Google Sign-in will NOT work in Expo Go - it requires native code. You must use:
- EAS Build (development, preview, or production)
- OR expo-dev-client

### **For EAS Builds:**

1. **Build your app:**
   ```bash
   eas build --profile preview --platform ios
   # or
   eas build --profile preview --platform android
   ```

2. **Install the build** on your device

3. **Test Google Sign-in:**
   - Tap "Continue with Google"
   - Select your Google account
   - Grant permissions
   - Should sign in and create/login to your account ✅

---

## **Verification Checklist**

- [ ] Web Client ID copied from Google Cloud Console
- [ ] `.env` file created with `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- [ ] EAS secret created OR eas.json updated
- [ ] Google Sign-in imports uncommented in both auth screens
- [ ] Google plugin added back to `app.json`
- [ ] Supabase Google provider configured
- [ ] EAS build completed successfully
- [ ] Google Sign-in works in the installed build

---

## **Troubleshooting**

### Issue: "Google Sign-in not configured" message

**Solution:** Make sure your Client ID is properly set in `.env` or `eas.json`

### Issue: "DEVELOPER_ERROR" when signing in

**Causes:**
- Wrong Client ID (using Android/iOS ID instead of Web ID)
- SHA-1 fingerprint not added to Google Cloud Console (Android)
- Bundle ID doesn't match Google Cloud Console configuration

**Solution:**
- Verify you're using the **Web Client ID**
- Add your app's SHA-1 fingerprint (Android only)
- Check bundle ID matches in both places

### Issue: Still crashes in Expo Go

**Solution:** 
Google Sign-in requires native code and won't work in Expo Go. You must:
- Build with: `eas build --profile development --platform ios`
- Use the custom development build instead of Expo Go

### Issue: Environment variable not found

**Solution:**
- Restart your dev server: `npx expo start --clear`
- Verify `.env` file is in the root directory (not in a subfolder)
- Check variable name is exactly: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

---

## **Security Best Practices**

1. ✅ **Never commit `.env` to Git** (already in `.gitignore`)
2. ✅ **Use EAS Secrets for production** instead of hardcoding
3. ✅ **Rotate keys regularly** (every 6-12 months)
4. ✅ **Use different keys** for development/staging/production
5. ✅ **Restrict OAuth scopes** to only what you need

---

## **Summary**

**Quick Steps:**
1. Get Web Client ID from Google Cloud Console
2. Add to `.env`: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-id`
3. Add to EAS: `eas secret:create` or update `eas.json`
4. Uncomment Google Sign-in imports in auth screens
5. Add plugin back to `app.json`
6. Build with EAS and test

**Remember:** Google Sign-in only works in EAS builds, NOT Expo Go!

