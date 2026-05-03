import { MemoryService } from '../services/memoryService';
import { Memory, MemoryCategory } from '../models/memory';

export interface SaveMemoryInput {
  category: MemoryCategory;
  content: string;
  confidence?: number;
}

export interface SaveMemoryResult {
  success: boolean;
  message: string;
  memory?: Memory;
}

export async function executeSaveMemory(
  userId: string,
  input: SaveMemoryInput,
  conversationId?: string
): Promise<SaveMemoryResult> {
  try {
    // createMemory handles duplicate detection internally
    const memory = await MemoryService.createMemory(userId, {
      category: input.category,
      content: input.content,
      confidence: input.confidence || 0.8,
      sourceConversationId: conversationId,
    });

    return {
      success: true,
      message: `Remembered: "${input.content}"`,
      memory,
    };
  } catch (error: any) {
    console.error('Failed to save memory:', error);
    return {
      success: false,
      message: `Failed to save memory: ${error.message}`,
    };
  }
}
