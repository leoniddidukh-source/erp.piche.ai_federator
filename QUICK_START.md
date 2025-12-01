# Quick Start Guide

## Installation

```bash
pnpm install
```

## Configuration

1. Create `.env` file in root directory (or use `.env.local` for local development):

```env
# Firebase Client Configuration (get from Firebase Console → Project Settings → General)
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id (optional)
REACT_APP_FIREBASE_APP_ID=your-app-id (optional)

# Gemini API Configuration
REACT_APP_GEMINI_API_KEY=your-gemini-api-key
```

**Note**: All environment variables must be prefixed with `REACT_APP_` to be accessible in the frontend.

## How to Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings → General
4. Scroll down to "Your apps" section
5. If you don't have a web app, click "Add app" → Web (</> icon)
6. Copy the configuration values from the `firebaseConfig` object

## How to Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key

## Run Application

```bash
pnpm run dev
```

The application will run on `http://localhost:5173` (or the next available port).

## Features

✅ **AI Assistant** - Chat with Gemini Flash about module states  
✅ **Module Monitoring** - View real-time module states  
✅ **Firebase Integration** - Reads logs from Firebase Storage (client-side)  
✅ **Module Filtering** - Filter by specific modules  
✅ **State Summarization** - Get AI-generated summaries  

## Firebase Storage Structure

Your Firebase Storage should have logs organized as:

```
logs/
  ├── module-name-1/
  │   ├── 2024-01-01T00:00:00Z.json
  │   └── 2024-01-01T01:00:00Z.json
  └── module-name-2/
      └── 2024-01-01T00:00:00Z.json
```

Each log file should contain JSON in this format:

```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "moduleName": "module-name-1",
  "stateDescription": "Module is running normally",
  "summarization": "All systems operational"
}
```

## Important Notes

- **No Backend Required**: All logic runs in the frontend using Firebase client SDK
- **Security**: Make sure to configure Firebase Storage security rules appropriately
- **CORS**: If accessing Firebase Storage from a browser, ensure CORS is configured in Firebase Console

For detailed setup, see `SETUP.md`.
