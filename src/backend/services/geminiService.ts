import { GoogleGenerativeAI } from '@google/generative-ai';

import type { ModuleLog } from './firebaseService';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use model from env variable, default to gemini-2.0-flash-lite (lightest/fastest model)
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
      this.model = this.genAI.getGenerativeModel({ model: modelName });
      console.log(`Gemini initialized successfully with ${modelName}`);
    } else {
      console.warn('GEMINI_API_KEY not set. AI features will not work.');
    }
  }

  /**
   * Generate a response using Gemini Flash based on module logs
   */
  async generateResponse(query: string, moduleLogs: ModuleLog[]): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please set GEMINI_API_KEY environment variable.');
    }

    try {
      // Format module logs for context
      const logsContext = this.formatLogsForContext(moduleLogs);

      const prompt = `You are an AI assistant that helps monitor and analyze the state of modules in a module federation architecture.

Available module logs:
${logsContext}

User query: ${query}

Please provide a helpful response based on the module logs. If the query asks about specific modules, focus on those. If asking for a summary, provide a comprehensive overview of all modules.

Response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a summary of all module states
   */
  async getModuleStatesSummary(moduleLogs: ModuleLog[]): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const logsContext = this.formatLogsForContext(moduleLogs);

      const prompt = `Analyze the following module logs and provide a comprehensive summary of the current state of all modules in the module federation architecture.

Module logs:
${logsContext}

Please provide:
1. Overall system health status
2. Status of each module (timestamp, state description, summarization)
3. Any issues or warnings
4. Recommendations if needed

Summary:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  /**
   * Format module logs into a readable context string
   */
  private formatLogsForContext(logs: ModuleLog[]): string {
    if (logs.length === 0) {
      return 'No module logs available.';
    }

    return logs
      .map((log, index) => {
        return `Module ${index + 1}:
  Name: ${log.moduleName || 'Unknown'}
  Timestamp: ${log.timestamp}
  State Description: ${log.stateDescription || 'N/A'}
  Summarization: ${log.summarization || 'N/A'}
  Additional Data: ${JSON.stringify(log, null, 2)}`;
      })
      .join('\n\n');
  }

  /**
   * Chat with the AI assistant (conversation mode)
   */
  async chat(messages: ChatMessage[], moduleLogs: ModuleLog[]): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const logsContext = this.formatLogsForContext(moduleLogs);

      // Build conversation history
      const conversationHistory = messages
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const lastMessage = messages[messages.length - 1]?.content || '';

      const prompt = `You are an AI assistant that helps monitor and analyze the state of modules in a module federation architecture.

Available module logs:
${logsContext}

Conversation history:
${conversationHistory}

Current user query: ${lastMessage}

Please provide a helpful response based on the module logs and conversation context.

Response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
export type { ChatMessage };
