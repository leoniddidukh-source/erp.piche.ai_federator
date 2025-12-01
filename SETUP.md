# AI Assistant Setup Guide

This guide will help you set up the AI Assistant for monitoring module federation architecture.

## Prerequisites

- Node.js 20+ and pnpm installed
- Firebase project with Storage enabled
- Google AI Studio account (for Gemini API key)

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key" and download the JSON file
5. Extract the following values from the JSON:
   - `project_id`
   - `private_key` (keep the `\n` characters)
   - `client_email`
   - `storageBucket` (from Firebase Console → Storage)

## Step 3: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key

## Step 4: Create Environment File

Create a `.env` file in the root directory:

```bash
cp src/backend/.env.example .env
```

Edit `.env` and fill in your values:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-storage-bucket.appspot.com

# Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key

# Server Configuration
PORT=3001
```

**Important**:

- The `FIREBASE_PRIVATE_KEY` must include the `\n` characters for newlines
- Wrap the private key in quotes if it contains special characters

## Step 5: Set Up Firebase Storage Structure

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

## Step 6: Run the Backend

### Development Mode

```bash
pnpm run dev:backend
```

The server will start on `http://localhost:3001` (or your configured PORT).

### Production Mode

```bash
pnpm run build:backend
pnpm run start:backend
```

## Step 7: Test the Backend

1. Check health endpoint:

   ```bash
   curl http://localhost:3001/health
   ```

2. Get available modules:

   ```bash
   curl http://localhost:3001/api/v1/module-state/modules/list
   ```

3. Chat with AI:
   ```bash
   curl -X POST http://localhost:3001/api/v1/ai-assistant/chat \
     -H "Content-Type: application/json" \
     -d '{"query": "What is the status of all modules?"}'
   ```

## Step 8: Use in Frontend

The AI Assistant component is already integrated into `PicheReactAppTemplate`. You can also use it directly:

```tsx
import { AIAssistant } from './app/AIAssistant';

<AIAssistant apiUrl='http://localhost:3001' />;
```

## Troubleshooting

### "Firebase not initialized" Error

- Verify all Firebase environment variables are set
- Check that `FIREBASE_PRIVATE_KEY` includes `\n` characters
- Ensure the service account has Storage Admin role

### "Gemini API not initialized" Error

- Verify `GEMINI_API_KEY` is set correctly
- Check API quota in Google AI Studio
- Ensure the API key has access to Gemini Flash

### "Module logs not found"

- Verify Firebase Storage bucket name is correct
- Check that logs are in the `logs/` prefix
- Ensure log files are valid JSON format
- Verify service account has read permissions

### Port Already in Use

Change the `PORT` in your `.env` file to a different port.

## API Documentation

See `src/backend/README.md` for detailed API documentation.
