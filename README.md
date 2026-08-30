# VitaMind Ultimate v2

## Upload
Replace the repository files with:
- index.html
- styles.css
- app.js
- sw.js
- manifest.webmanifest
- api/chat.js
- api/scan.js

Keep the `api` folder exactly as shown.

## Vercel environment variables
Required:
- GEMINI_API_KEY

Optional:
- GEMINI_MODEL

If GEMINI_MODEL is not set, the backend uses `gemini-flash-latest`.

## Security
The Gemini API key is never placed in frontend code. It is read only by the Vercel server-side API routes.

## Features
- Premium responsive UI
- Gemini AI chat via /api/chat
- Image ingredient/label scanner via /api/scan
- Camera + image upload scanner UI
- Learn page with health education topics
- Water, sleep, activity, BMI, reminders, progress
- LocalStorage persistence
- PWA support

## Important
Browser notifications and camera require user permission. Background reminder behavior depends on the browser and operating system. AI scanner output is educational and should be checked against the original package label.
