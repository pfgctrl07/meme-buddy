# Release Checklist

## What Is Ready In Code

- Expo mobile app with modular screens/components
- Local Flask backend with persistent SQLite storage
- Frontend service layer wired to backend endpoints
- Create/join/dashboard/discovery/alerts/event/profile/leaderboard flows
- Expo build config via `app.json` and `eas.json`

## Still Required Before App Store / Play Store Submission

### App Assets

- App icon
- Adaptive Android icon
- Splash image or branded splash assets
- Store screenshots for phone sizes
- App Store / Play Store marketing text

### Legal / Product

- Privacy policy URL
- Terms of service URL if applicable
- Data handling disclosures
- Support email / contact details

### Native Identifiers

- Confirm `ios.bundleIdentifier`
- Confirm `android.package`
- Apple Developer account
- Google Play Developer account

### Technical

- Replace demo auth token handling with real auth/session flow
- Replace SQLite demo persistence with production database if multi-user support is required
- Add QA testing for iOS and Android devices
- Add crash/error monitoring
- Add analytics if desired
- Review API security and CORS for production deployment

## Recommended Build Flow

### Backend

```bash
python3 -m pip install -r backend/requirements.txt
python3 backend/app.py
```

### Frontend

```bash
cp .env.example .env
npx expo start
```

### Production Builds

```bash
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
```

## Important Note

The codebase is now production-shaped, but store submission still requires the non-code assets and account setup listed above. Without those, it is not truly upload-ready even if the app builds.
