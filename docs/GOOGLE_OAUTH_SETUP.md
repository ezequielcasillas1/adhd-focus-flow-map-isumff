# Google OAuth Setup Guide

## Prerequisites
- Google Cloud Console account
- EAS account (for native builds)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** or **Google Identity Services**

## Step 2: Create OAuth Credentials

### For Android:

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Select **Android** as application type
4. Get your **SHA-1 fingerprint**:
   ```bash
   # For development:
   cd android && ./gradlew signingReport
   
   # For EAS builds:
   eas credentials
   ```
5. Enter your package name: `com.flowfocus.app`
6. Enter SHA-1 fingerprint
7. Copy the **Client ID**

### For iOS:

1. Create another OAuth Client ID
2. Select **iOS** as application type
3. Enter bundle ID: `com.flowfocus.app`
4. Copy the **Client ID** and **URL Scheme**

### For Web (Required for Supabase):

1. Create another OAuth Client ID
2. Select **Web application**
3. Add authorized redirect URIs:
   - `https://brwhhkmjyadcaasqggtd.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local testing)
4. Copy the **Web Client ID** - this is the most important one!

## Step 3: Configure Your App

1. Update `.env` file:
   ```bash
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   ```

2. Update `app.json`:
   - Replace the placeholder in the Google Sign-in plugin configuration
   - Use the iOS URL scheme from Google Console

## Step 4: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Add your **Web Client ID** and **Client Secret** from Google Console
5. Save changes

## Step 5: Test

1. Build development client:
   ```bash
   eas build --profile development --platform android
   ```

2. Install on device and test Google Sign-in

## Troubleshooting

### "Developer Error" on Android
- Check SHA-1 fingerprint matches
- Verify package name is correct
- Wait 5-10 minutes for Google to propagate changes

### "Sign in cancelled" on iOS
- Verify URL scheme in app.json matches Google Console
- Check bundle identifier matches

### "Invalid OAuth client"
- Ensure web client ID is added to Supabase
- Check redirect URIs in Google Console

