# Flow Focus - ADHD Timer App

A React Native app built with Expo for managing focus sessions with timer functionality.

## 🚀 Quick Start

### Development with Expo Go (Limited - No Native Modules)

```bash
npm install
npm start
```

Scan the QR code with Expo Go app.

**Note:** Google Sign-in won't work in Expo Go. Use email/password authentication for testing.

### Production Development Client (Recommended)

Build a custom development client with all native modules:

```bash
# Initialize EAS project (if not done)
eas init

# Build development client
eas build --profile development --platform android
# or
eas build --profile development --platform ios

# Install the downloaded APK/IPA on your device
# Then run:
npm start
```

## 🔧 Configuration

### 1. Environment Variables

Copy `.env` and fill in your credentials:

```bash
# Supabase (already configured)
EXPO_PUBLIC_SUPABASE_URL=https://brwhhkmjyadcaasqggtd.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 2. Google OAuth Setup

See detailed instructions in: [`docs/GOOGLE_OAUTH_SETUP.md`](docs/GOOGLE_OAUTH_SETUP.md)

## 📱 Tech Stack

### Core (Current Phase)
- **React Native** (Expo managed workflow)
- **Expo Router** (file-based navigation)
- **NativeWind** (Tailwind CSS for React Native)
- **Supabase** (auth, database)
- **TypeScript**

### Native Modules
- `@react-native-google-signin/google-signin` - Google OAuth
- `expo-av` - Audio/video playback
- `expo-haptics` - Haptic feedback
- `react-native-reanimated` - Animations

## 📂 Project Structure

```
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── integrations/      # Third-party integrations
├── components/            # Reusable components
├── src/
│   ├── context/          # React contexts
│   └── services/         # Business logic services
├── assets/               # Images, fonts
├── docs/                 # Documentation
└── styles/              # Common styles

```

## 🔨 Available Scripts

```bash
npm start              # Start Expo dev server
npm run dev            # Start with tunnel (for remote testing)
npm run android        # Open on Android device/emulator
npm run ios            # Open on iOS device/simulator
npm run web            # Open in web browser

npm run lint           # Run ESLint
npm run type-check     # Run TypeScript checks

# EAS Build Scripts
npm run build:development  # Build dev client
npm run build:preview      # Build preview version
npm run build:production   # Build production version
```

## 🏗️ Build & Deploy

### Development Build
```bash
eas build --profile development --platform all
```

### Production Build
```bash
# Android
eas build --profile production --platform android

# iOS
eas build --profile production --platform ios
```

### Submit to Stores
```bash
# Google Play
eas submit --platform android

# App Store
eas submit --platform ios
```

## 📖 Documentation

- [Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)
- [Error Handling](docs/ERROR_HANDLING.md)
- [Production Readiness](docs/PRODUCTION_READINESS.md)
- [Development Guide](GUIDE.md)

## 🐛 Known Issues

1. **Google Sign-in doesn't work in Expo Go** - Use development build or email/password auth
2. **Missing icon.png warning** - Fixed in latest commit, restart dev server if persists

## 🔐 Security

- Never commit `.env` file (already in `.gitignore`)
- Rotate API keys regularly
- Use Supabase RLS for data security

## 📝 License

Private project - All rights reserved

## 🤝 Support

For issues or questions, refer to the documentation in the `docs/` folder.

