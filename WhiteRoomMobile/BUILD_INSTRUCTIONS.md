# WhiteRoom.exe Mobile - Build Instructions

## Prerequisites

1. **Install Xcode** from the Mac App Store (required for iOS builds)
2. **Install Xcode Command Line Tools**:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

## Option 1: Build for iPhone (IPA Package)

### Using EAS Build (Recommended)

1. **Create Expo account** at [expo.dev](https://expo.dev)

2. **Login to EAS**:
   ```bash
   cd WhiteRoomMobile
   eas login
   ```

3. **Configure the project**:
   ```bash
   eas build:configure
   ```

4. **Build for iOS**:
   ```bash
   eas build --platform ios --profile production
   ```

5. **Download the IPA** from the EAS dashboard or use:
   ```bash
   eas build:list
   ```

### Using Local Build (Requires Xcode)

1. **Generate iOS project**:
   ```bash
   npx expo eject
   ```

2. **Open in Xcode**:
   ```bash
   open ios/WhiteRoomMobile.xcworkspace
   ```

3. **Configure signing** in Xcode with your Apple Developer account

4. **Build and Archive** in Xcode to create IPA

## Option 2: Quick Testing

### iOS Simulator (Mac only)
```bash
npm run ios
```

### Web Browser
```bash
npm run web
```

### Expo Go App (Phone)
```bash
npm start
# Scan QR code with Expo Go app
```

## Installation Methods

### Method 1: TestFlight (Requires Apple Developer Account)
1. Upload IPA to App Store Connect
2. Create TestFlight build
3. Install via TestFlight app on iPhone

### Method 2: Direct IPA Installation (Jailbroken/Developer Device)
1. Use tools like Cydia Impactor or AltStore
2. Install IPA directly on device

### Method 3: Expo Go (Development)
1. Install Expo Go from App Store
2. Scan QR code from `npm start`
3. Test without building IPA

## App Features

- 🎮 **Matrix-themed UI** with cyberpunk aesthetics
- 🌐 **Native mobile experience** optimized for touch
- ⚡ **Offline capabilities** when built as native app
- 📱 **iPhone-optimized** with proper status bar handling
- 🎨 **Dark theme** with green matrix styling

## Bundle Identifier
- iOS: `com.whiteroom.exe`
- App Name: `WhiteRoom.exe`

Your WhiteRoom.exe mobile app is ready to build! Choose the method that works best for your setup.