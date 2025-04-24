# Baccarat Scoreboard

A React Native application for tracking Baccarat game scores.

## Prerequisites

- macOS
- Xcode 14.0 or later
- Node.js 16.0 or later
- CocoaPods (`brew install cocoapods`)
- iOS 15.1 or later (for running on device)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd baccarat-scoreboard
```

2. Install JavaScript dependencies:
```bash
npm install
```

3. Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

4. Open the project in Xcode:
- Navigate to the `ios` folder
- Open `BaccaratScoreboard.xcworkspace` (NOT .xcodeproj)

5. Configure signing in Xcode:
- Click on "BaccaratScoreboard" in the left sidebar
- Select "Signing & Capabilities"
- Check "Automatically manage signing"
- Select your personal team (Apple ID)
- Change the Bundle Identifier to something unique (e.g., "com.[yourusername].baccaratapp")

6. Connect your iPhone:
- Connect your iPhone to your Mac with a USB cable
- Trust your computer on your iPhone if prompted
- Enable Developer Mode on your iPhone (Settings → Privacy & Security → Developer Mode)
- Select your iPhone from the device dropdown in Xcode

7. Build and Run:
- Click the Play (▶️) button or press Command (⌘) + R

## Troubleshooting

If you encounter build issues:
1. Clean the build folder in Xcode (Shift + Command + K)
2. Close Xcode
3. Run these commands:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```
4. Reopen `BaccaratScoreboard.xcworkspace` in Xcode

## Note for First-Time Installation

When you first run the app on your iPhone:
1. You might need to trust the developer profile:
   - Go to Settings → General → VPN & Device Management
   - Find your Apple ID
   - Tap "Trust [Your Apple ID]"

2. If Developer Mode is not enabled:
   - Go to Settings → Privacy & Security
   - Scroll down to Developer Mode
   - Toggle it ON
   - Your iPhone will restart 