# Expo Go Compatibility Fixes

## Problem Solved ✅

The app was crashing in Expo Go with the error:
```
TurboModuleRegistry.getEnforcing(...): 'RNGoogleSignin' could not be found
```

**Root Cause:** The `@react-native-google-signin/google-signin` package requires native code that doesn't exist in Expo Go. When the auth screens loaded, they tried to import the Google Sign-in module at the top level, causing an immediate crash.

## Changes Made

### 1. **Commented Out Google Sign-in Imports** ✅
- `app/(auth)/sign-in.tsx`: Commented out lines 20-24
- `app/(auth)/sign-up.tsx`: Commented out lines 20-24

### 2. **Disabled Google Sign-in Configuration** ✅
Both auth screens now skip Google Sign-in setup and show a clear message to users.

### 3. **Removed Plugin from app.json** ✅
Removed `@react-native-google-signin/google-signin` from the plugins array to prevent Expo from trying to configure the native module.

### 4. **Updated UI Messages** ✅
- Google Sign-in button is now grayed out with text "(Requires EAS Build)"
- Info banner explains Expo Go limitations
- Tapping the button shows a helpful alert message

## Current Functionality

### ✅ Working in Expo Go:
- Email/password sign-in
- Email/password sign-up
- Email confirmation flow
- Forgot password
- Session management
- All authenticated features

### ⚠️ Disabled (Requires EAS Build):
- Google Sign-in

## Re-enabling Google Sign-in for EAS Build

When you're ready to build with EAS and enable Google Sign-in:

### Step 1: Uncomment the Imports

In `app/(auth)/sign-in.tsx` and `app/(auth)/sign-up.tsx`, uncomment:
```typescript
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
```

### Step 2: Restore app.json Plugin

Add back to the `plugins` array in `app.json`:
```json
"plugins": [
  "expo-font",
  "expo-router",
  "expo-web-browser",
  [
    "@react-native-google-signin/google-signin"
  ]
],
```

### Step 3: Configure Google Cloud Console

Follow the guide in `docs/GOOGLE_OAUTH_SETUP.md`:
1. Create OAuth 2.0 credentials
2. Configure iOS/Android bundle IDs
3. Add Web Client ID to environment variables

### Step 4: Set Environment Variables

In `eas.json`, add under each build profile:
```json
"env": {
  "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "your-web-client-id.apps.googleusercontent.com"
}
```

### Step 5: Build with EAS

```bash
# For iOS
eas build --platform ios --profile preview

# For Android
eas build --platform android --profile preview
```

### Step 6: Update the UI

In both auth screens, replace:
```typescript
<TouchableOpacity
  style={[styles.googleButtonCustom, { opacity: 0.5 }]}
  onPress={handleGoogleSignIn}
>
  <IconSymbol name="globe" size={20} color="white" />
  <Text style={styles.googleButtonText}>Continue with Google (Requires EAS Build)</Text>
</TouchableOpacity>
```

With the conditional rendering from the original code.

## Testing Checklist

### Expo Go Testing ✅
- [x] App launches without crashes
- [x] Sign-in screen loads
- [x] Sign-up screen loads
- [x] Email/password auth works
- [x] Google Sign-in shows appropriate message

### EAS Build Testing (When Ready)
- [ ] Google Sign-in button appears correctly
- [ ] Google OAuth flow completes
- [ ] User can sign in with Google
- [ ] User profile is created from Google data

## Notes

- The package `@react-native-google-signin/google-signin` is still installed in `package.json` but won't be used in Expo Go
- No need to remove it from dependencies - it will be needed for EAS builds
- This pattern (conditional native module usage) is common when developing with Expo Go

## Alternative: Use expo-dev-client

Instead of Expo Go, you can create a custom development client that includes native modules:

```bash
# Install expo-dev-client
npm install expo-dev-client

# Create development build
eas build --profile development --platform ios
```

This gives you Expo Go-like functionality with your custom native code included.

