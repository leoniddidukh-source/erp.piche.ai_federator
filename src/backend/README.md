# AI Assistant Backend

This backend service provides an AI-powered assistant for monitoring and analyzing module states in a module federation architecture.

## Features

- **Firebase Storage Integration**: Reads module logs from Firebase Storage
- **Gemini Flash AI**: Uses Google's Gemini Flash model for intelligent responses
- **Module State Monitoring**: Retrieves and analyzes module states (timestamp, state description, summarization)
- **RESTful API**: Provides endpoints for querying module states and chatting with the AI

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

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

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a service account and download the JSON key
3. Extract the following from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `storageBucket` → `FIREBASE_STORAGE_BUCKET`

### 4. Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### 5. Firebase Storage Structure

Ensure your Firebase Storage has logs organized as:
```
logs/
  ├── module-name-1/
  │   ├── 2024-01-01T00:00:00Z.json
  │   └── 2024-01-01T01:00:00Z.json
  └── module-name-2/
      └── 2024-01-01T00:00:00Z.json
```

Each log file should contain JSON with:
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "moduleName": "module-name-1",
  "stateDescription": "Module is running normally",
  "summarization": "All systems operational"
}
```

## Running the Backend

### Development Mode

```bash
pnpm run dev:backend
```

### Production Mode

```bash
pnpm run build:backend
pnpm run start:backend
```

The server will start on `http://localhost:3001` (or the port specified in `PORT` env variable).

## API Endpoints

### Health Check

```
GET /health
```

Returns server health status.

### Chat with AI Assistant

```
POST /api/v1/ai-assistant/chat
Content-Type: application/json

{
  "query": "What is the status of module X?",
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "model", "content": "Hi! How can I help?" }
  ],
  "moduleName": "optional-module-name",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-02T00:00:00Z"
}
```

### Get Module States Summary

```
POST /api/v1/ai-assistant/summary
Content-Type: application/json

{
  "moduleName": "optional-module-name",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-02T00:00:00Z"
}
```

### Get Module States

```
GET /api/v1/module-state?moduleName=optional-name&startDate=2024-01-01&endDate=2024-01-02
```

### Get Specific Module State

```
GET /api/v1/module-state/:moduleName
```

### Get Available Modules

```
GET /api/v1/module-state/modules/list
```

## Frontend Integration

The frontend component `AIAssistant` can be used in your React app:

```tsx
import { AIAssistant } from './app/AIAssistant';

<AIAssistant apiUrl="http://localhost:3001" />
```

## Troubleshooting

### Firebase Not Initialized

- Check that all Firebase environment variables are set correctly
- Ensure the private key includes `\n` characters for newlines
- Verify the service account has Storage Admin permissions

### Gemini API Errors

- Verify `GEMINI_API_KEY` is set correctly
- Check API quota limits
- Ensure the API key has access to Gemini Flash model

### Module Logs Not Found

- Verify Firebase Storage bucket name is correct
- Check that logs are stored in the `logs/` prefix
- Ensure log files are in valid JSON format

