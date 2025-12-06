# Assets Directory

This directory should contain app icons and splash screens for publishing.

## Required Assets for Publishing

When you're ready to publish to App Store or Google Play, you'll need:

### App Icon
- **icon.png**: 1024x1024 px
- Should be your app logo/branding
- No transparency (use solid background)

### Adaptive Icon (Android)
- **adaptive-icon.png**: 1024x1024 px
- Foreground image that appears on top of background
- Can have transparency

### Splash Screen
- **splash.png**: 1284x2778 px (or similar high resolution)
- Shows while app is loading
- Background color set in app.json (currently #4F46E5 - indigo)

### Favicon (Web)
- **favicon.png**: 48x48 px
- For web version of the app

## Creating Icons

You can create simple placeholder icons using:

1. **Online Tools:**
   - https://www.canva.com/
   - https://www.figma.com/
   - https://appicon.co/

2. **Icon Generator:**
   - Create one 1024x1024 image
   - Use tools like https://easyappicon.com/ to generate all sizes

3. **Use Expo's Default:**
   - The app will use Expo's default icon if files are missing
   - Fine for development/testing
   - **Must replace before publishing**

## Temporary Solution

For development, you can use solid color PNG files:

1. Create 1024x1024 images with solid colors
2. Add your app name as text
3. Save as icon.png, adaptive-icon.png, etc.

## Current Configuration

Check `app.json` for asset paths and colors:
- Icon: ./assets/icon.png
- Splash: ./assets/splash.png
- Adaptive Icon: ./assets/adaptive-icon.png
- Splash Background: #4F46E5 (indigo)

The app will work without these during development.
