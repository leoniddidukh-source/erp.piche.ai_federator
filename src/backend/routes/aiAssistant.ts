import type { Request, Response } from 'express';
import { Router } from 'express';

import { firebaseService } from '../services/firebaseService';
import type { ChatMessage } from '../services/geminiService';
import { geminiService } from '../services/geminiService';

export const aiAssistantRouter = Router();

/**
 * POST /api/v1/ai-assistant/chat
 * Chat with the AI assistant about module states
 */
aiAssistantRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { query, messages, moduleName, startDate, endDate } = req.body;

    if (!query && (!messages || messages.length === 0)) {
      return res.status(400).json({
        error: 'Either "query" or "messages" must be provided',
      });
    }

    // Fetch relevant module logs
    const moduleLogs = await firebaseService.getModuleLogs(
      moduleName,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    let response: string;

    if (messages && Array.isArray(messages)) {
      // Conversation mode
      response = await geminiService.chat(messages as ChatMessage[], moduleLogs);
    } else {
      // Single query mode
      response = await geminiService.generateResponse(query, moduleLogs);
    }

    res.json({
      response,
      timestamp: new Date().toISOString(),
      modulesAnalyzed: moduleLogs.length,
    });
  } catch (error) {
    console.error('Error in AI assistant chat:', error);
    res.status(500).json({
      error: 'Failed to process AI request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/ai-assistant/summary
 * Get a summary of all module states
 */
aiAssistantRouter.post('/summary', async (req: Request, res: Response) => {
  try {
    const { moduleName, startDate, endDate } = req.body;

    const moduleLogs = await firebaseService.getModuleLogs(
      moduleName,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    const summary = await geminiService.getModuleStatesSummary(moduleLogs);

    res.json({
      summary,
      timestamp: new Date().toISOString(),
      modulesAnalyzed: moduleLogs.length,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
