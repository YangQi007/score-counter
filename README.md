# Baccarat Scoreboard App

A React Native application for tracking and managing baccarat game scores with multiple panels and search functionality.

## Features

- Main scoreboard panel (6 rows)
- Search panel (5 rows)
- History panel for pattern searching
- Save and load game records
- Pattern search functionality
- Round symbol display
- Support for multiple symbols (庄, 闲, 和, etc.)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Xcode (for iOS development)
- CocoaPods (for iOS dependencies)
- Expo CLI
- iOS device running iOS 13.0 or later (for physical device installation)

## Installation

### Using Expo (Easiest Method)

1. Install Expo Go app on your iPhone from the App Store

2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd baccarat-scoreboard
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

5. Open Expo Go on your iPhone and scan the QR code shown in the terminal
   - Make sure your iPhone and computer are on the same network

### Local iPhone Installation (Through Xcode)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd baccarat-scoreboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create iOS build files:
   ```bash
   npx expo prebuild -p ios
   ```

4. Install CocoaPods dependencies:
   ```bash
   cd ios
   pod install
   cd ..
   ```

5. Open the Xcode workspace:
   - Navigate to the `ios` folder
   - Open `baccaratapp.xcworkspace` (NOT `.xcodeproj`)

6. In Xcode:
   - Select your project in the navigator
   - Select your target under TARGETS
   - Under "Signing & Capabilities":
     - Select your Team (Apple ID)
     - Bundle Identifier should be "com.qiyang2017.baccaratapp"

7. Connect your iPhone:
   - Connect your iPhone to your Mac with a USB cable
   - Trust your computer on your iPhone if prompted
   - Select your iPhone from the device dropdown in Xcode

8. Build and Run:
   - Click the Play (▶) button in Xcode
   - Or use Command (⌘) + R

9. On your iPhone:
   - Go to Settings > General > Device Management
   - Trust the developer profile (your Apple ID)
   - The app should now work

## Troubleshooting

### Common Issues

1. "Untrusted Developer" message:
   - Go to Settings > General > Device Management
   - Tap your Apple ID
   - Tap "Trust"

2. Build fails:
   - Clean the build folder in Xcode (Shift + Command + K)
   - Try building again

3. App doesn't install:
   - Delete the app from your device
   - Restart your iPhone
   - Try installing again

### Important Notes

- Using a free Apple Developer account:
  * The app will remain installed for 7 days
  * After 7 days, you'll need to reinstall it

- Using a paid Apple Developer account:
  * The app will remain installed for 1 year

## Development

To start development:

1. Start the development server:
   ```bash
   npx expo start
   ```

2. Press 'i' to open in iOS Simulator
   - Or scan the QR code with Expo Go app

## License

[Your License]

## Contact

For any questions or issues, please contact [Your Contact Information] 