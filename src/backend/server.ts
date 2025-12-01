import 'dotenv/config';

import cors from 'cors';
import express, { type Request, type Response } from 'express';

import { aiAssistantRouter } from './routes/aiAssistant';
import { moduleStateRouter } from './routes/moduleState';

const app = express();
const PORT = process.env.PORT || '3001';

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/ai-assistant', aiAssistantRouter);
app.use('/api/v1/module-state', moduleStateRouter);

app.listen(PORT, () => {
  console.log(`AI Assistant Backend Server running on port ${PORT}`);
});

export default app;
