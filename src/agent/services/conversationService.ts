import Anthropic from '@anthropic-ai/sdk';
import { db } from '../../config/firebase';
import { claudeClient } from '../clients/claudeClient';
import { buildSystemPrompt } from '../prompts/systemPrompt';
import * as userService from '../../services/userService';
import * as diaryService from '../../services/diaryService';
import { MemoryService } from './memoryService';
import {
  TOOL_DEFINITIONS,
  executeLogFood,
  executeLogExercise,
  executeSaveMemory,
  executeGetMemories,
  executeCreateMealPlan,
  executeGetDiary,
  executeRemoveFood,
  executeRemoveExercise,
  executeLogWeight,
  executeEditFood,
} from '../tools';
import {
  Conversation,
  Message,
  SendMessageInput,
  ChatResponse,
  ToolCall,
  StreamEvent,
} from '../models/conversation';

const CONVERSATIONS_COLLECTION = 'conversations';

/**
 * Recursively removes undefined values from an object.
 * Firestore doesn't accept undefined values, so we need to clean objects before saving.
 */
function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined) as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = stripUndefined(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

export class ConversationService {
  static async getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
    const doc = await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as Conversation;

    if (data.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return { ...data, id: doc.id };
  }

  static async listConversations(userId: string, limit = 20): Promise<Conversation[]> {
    const snapshot = await db
      .collection(CONVERSATIONS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Conversation),
      id: doc.id,
    }));
  }

  static async createConversation(userId: string, title?: string): Promise<Conversation> {
    const now = new Date();
    const conversation: Omit<Conversation, 'id'> = {
      userId,
      title: title || 'New Chat',
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(CONVERSATIONS_COLLECTION).add(conversation);

    return { ...conversation, id: docRef.id };
  }

  static async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.getConversation(conversationId, userId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).delete();
  }

  static async sendMessage(
    userId: string,
    input: SendMessageInput
  ): Promise<ChatResponse> {
    let conversation: Conversation;

    if (input.conversationId) {
      const existing = await this.getConversation(input.conversationId, userId);
      if (!existing) {
        throw new Error('Conversation not found');
      }
      conversation = existing;
    } else {
      conversation = await this.createConversation(userId);
    }

    // Build context for system prompt
    const [userSettings, memories, todayDiary] = await Promise.all([
      this.getUserSettings(userId),
      MemoryService.getMemories(userId, true),
      this.getTodayDiary(userId),
    ]);

    const systemPrompt = buildSystemPrompt({
      userSettings,
      memories,
      todayDiary,
      currentDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    // Create user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.message,
      timestamp: new Date(),
    };

    // Build Claude messages from conversation history
    const claudeMessages = this.toClaudeMessages([...conversation.messages, userMessage]);

    // Call Claude with tools
    const toolsUsed: ToolCall[] = [];
    let response = await claudeClient.chat({
      systemPrompt,
      messages: claudeMessages,
      tools: TOOL_DEFINITIONS,
    });

    // Tool execution loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        console.log(`Executing tool: ${toolUse.name}`, toolUse.input);

        let result;
        try {
          result = await this.executeTool(
            toolUse.name,
            toolUse.input as Record<string, any>,
            userId,
            conversation.id
          );
          console.log(`Tool ${toolUse.name} result:`, JSON.stringify(result, null, 2));
        } catch (error: any) {
          console.error(`Tool ${toolUse.name} threw error:`, error);
          console.error('Error stack:', error.stack);
          result = { error: error.message };
        }

        toolsUsed.push({
          id: toolUse.id,
          name: toolUse.name,
          input: toolUse.input as Record<string, any>,
          result: stripUndefined(result),
        });

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      // Continue conversation with tool results
      claudeMessages.push({ role: 'assistant', content: response.content });
      claudeMessages.push({ role: 'user', content: toolResults });

      response = await claudeClient.chat({
        systemPrompt,
        messages: claudeMessages,
        tools: TOOL_DEFINITIONS,
      });
    }

    // Extract final text response
    const textContent = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    const assistantContent = textContent?.text || '';

    const assistantMessage: Message = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: assistantContent,
      timestamp: new Date(),
      ...(toolsUsed.length > 0 && { toolCalls: toolsUsed }),
    };

    // Save messages to conversation
    await this.saveMessages(conversation.id, [userMessage, assistantMessage]);

    // Generate title for new conversations
    if (!conversation.title || conversation.title === 'New Chat') {
      const title = this.generateTitle(input.message);
      await db.collection(CONVERSATIONS_COLLECTION).doc(conversation.id).update({ title });
    }

    return {
      conversationId: conversation.id,
      message: assistantMessage,
      toolsUsed: toolsUsed.map((t) => t.name),
    };
  }

  static async *sendMessageStream(
    userId: string,
    input: SendMessageInput
  ): AsyncGenerator<StreamEvent> {
    let conversation: Conversation;

    if (input.conversationId) {
      const existing = await this.getConversation(input.conversationId, userId);
      if (!existing) {
        yield { type: 'error', message: 'Conversation not found' };
        return;
      }
      conversation = existing;
    } else {
      conversation = await this.createConversation(userId);
    }

    yield { type: 'message_start', conversationId: conversation.id };

    // Build context for system prompt
    const [userSettings, memories, todayDiary] = await Promise.all([
      this.getUserSettings(userId),
      MemoryService.getMemories(userId, true),
      this.getTodayDiary(userId),
    ]);

    const systemPrompt = buildSystemPrompt({
      userSettings,
      memories,
      todayDiary,
      currentDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    // Create user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.message,
      timestamp: new Date(),
    };

    // Build Claude messages from conversation history
    const claudeMessages = this.toClaudeMessages([...conversation.messages, userMessage]);
    const toolsUsed: ToolCall[] = [];
    let fullText = '';

    // Start streaming
    const stream = claudeClient.chatStream({
      systemPrompt,
      messages: claudeMessages,
      tools: TOOL_DEFINITIONS,
    });

    // Process first stream - collect text and detect tool use
    let currentToolUse: { id: string; name: string; inputJson: string } | null = null;
    const pendingToolUses: Anthropic.ToolUseBlock[] = [];

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        if (event.content_block.type === 'tool_use') {
          currentToolUse = {
            id: event.content_block.id,
            name: event.content_block.name,
            inputJson: '',
          };
        }
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          fullText += event.delta.text;
          yield { type: 'text_delta', text: event.delta.text };
        } else if (event.delta.type === 'input_json_delta' && currentToolUse) {
          currentToolUse.inputJson += event.delta.partial_json;
        }
      } else if (event.type === 'content_block_stop') {
        if (currentToolUse) {
          const toolInput = JSON.parse(currentToolUse.inputJson || '{}');
          pendingToolUses.push({
            type: 'tool_use',
            id: currentToolUse.id,
            name: currentToolUse.name,
            input: toolInput,
          });
          currentToolUse = null;
        }
      }
    }

    // Get final message to check stop reason
    const finalMessage = await stream.finalMessage();

    // Process tool uses if any
    if (finalMessage.stop_reason === 'tool_use' && pendingToolUses.length > 0) {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of pendingToolUses) {
        console.log(`[Stream] Executing tool: ${toolUse.name}`, toolUse.input);
        yield {
          type: 'tool_start',
          id: toolUse.id,
          name: toolUse.name,
          input: toolUse.input as Record<string, any>,
        };

        let result;
        try {
          result = await this.executeTool(
            toolUse.name,
            toolUse.input as Record<string, any>,
            userId,
            conversation.id
          );
          console.log(`[Stream] Tool ${toolUse.name} result:`, JSON.stringify(result, null, 2));
        } catch (error: any) {
          console.error(`[Stream] Tool ${toolUse.name} threw error:`, error);
          console.error('Error stack:', error.stack);
          result = { error: error.message };
        }

        const success = !result.error;
        const cleanedResult = stripUndefined(result);
        toolsUsed.push({
          id: toolUse.id,
          name: toolUse.name,
          input: toolUse.input as Record<string, any>,
          result: cleanedResult,
        });

        yield {
          type: 'tool_result',
          id: toolUse.id,
          name: toolUse.name,
          success,
          result: cleanedResult,
        };

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      // Continue conversation with tool results (non-streaming for simplicity)
      claudeMessages.push({ role: 'assistant', content: finalMessage.content });
      claudeMessages.push({ role: 'user', content: toolResults });

      // Continue the agentic loop (non-streaming for subsequent turns)
      let response = await claudeClient.chat({
        systemPrompt,
        messages: claudeMessages,
        tools: TOOL_DEFINITIONS,
      });

      // Handle additional tool calls if any
      while (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(
          (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
        );

        const additionalToolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolUse of toolUseBlocks) {
          console.log(`[Stream Loop] Executing tool: ${toolUse.name}`, toolUse.input);
          yield {
            type: 'tool_start',
            id: toolUse.id,
            name: toolUse.name,
            input: toolUse.input as Record<string, any>,
          };

          let result;
          try {
            result = await this.executeTool(
              toolUse.name,
              toolUse.input as Record<string, any>,
              userId,
              conversation.id
            );
            console.log(`[Stream Loop] Tool ${toolUse.name} result:`, JSON.stringify(result, null, 2));
          } catch (error: any) {
            console.error(`[Stream Loop] Tool ${toolUse.name} threw error:`, error);
            console.error('Error stack:', error.stack);
            result = { error: error.message };
          }

          const success = !result.error;
          const cleanedResult = stripUndefined(result);
          toolsUsed.push({
            id: toolUse.id,
            name: toolUse.name,
            input: toolUse.input as Record<string, any>,
            result: cleanedResult,
          });

          yield {
            type: 'tool_result',
            id: toolUse.id,
            name: toolUse.name,
            success,
            result: cleanedResult,
          };

          additionalToolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(result),
          });
        }

        claudeMessages.push({ role: 'assistant', content: response.content });
        claudeMessages.push({ role: 'user', content: additionalToolResults });

        response = await claudeClient.chat({
          systemPrompt,
          messages: claudeMessages,
          tools: TOOL_DEFINITIONS,
        });
      }

      // Get final text from the last response
      const textContent = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );
      if (textContent) {
        // Stream the final text
        yield { type: 'text_delta', text: textContent.text };
        fullText = textContent.text;
      }
    }

    // Build final message
    const assistantMessage: Message = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: fullText,
      timestamp: new Date(),
      ...(toolsUsed.length > 0 && { toolCalls: toolsUsed }),
    };

    // Save messages to conversation
    await this.saveMessages(conversation.id, [userMessage, assistantMessage]);

    // Generate title for new conversations
    if (!conversation.title || conversation.title === 'New Chat') {
      const title = this.generateTitle(input.message);
      await db.collection(CONVERSATIONS_COLLECTION).doc(conversation.id).update({ title });
    }

    yield {
      type: 'message_complete',
      message: assistantMessage,
      toolsUsed: toolsUsed.map((t) => t.name),
    };
  }

  private static async executeTool(
    toolName: string,
    input: Record<string, any>,
    userId: string,
    conversationId: string
  ): Promise<any> {
    switch (toolName) {
      case 'log_food':
        return executeLogFood(userId, {
          name: input.name,
          calories: input.calories,
          protein: input.protein,
          carbs: input.carbs,
          fat: input.fat,
          mealType: input.mealType,
          servingSize: input.servingSize,
          date: input.date,
        });

      case 'log_exercise':
        return executeLogExercise(userId, {
          name: input.name,
          caloriesBurned: input.caloriesBurned,
          durationMin: input.durationMin,
          date: input.date,
        });

      case 'save_memory':
        return executeSaveMemory(
          userId,
          {
            category: input.category,
            content: input.content,
            confidence: input.confidence,
          },
          conversationId
        );

      case 'get_memories':
        return executeGetMemories(userId, {
          category: input.category,
        });

      case 'create_meal_plan':
        return executeCreateMealPlan(userId, {
          name: input.name,
          description: input.description,
          calorieTarget: input.calorieTarget,
          proteinTarget: input.proteinTarget,
          carbsTarget: input.carbsTarget,
          fatTarget: input.fatTarget,
          days: input.days,
        });

      case 'get_diary':
        return executeGetDiary(userId, {
          date: input.date,
        });

      case 'remove_food':
        return executeRemoveFood(userId, {
          foodId: input.foodId,
          mealType: input.mealType,
          date: input.date,
        });

      case 'remove_exercise':
        return executeRemoveExercise(userId, {
          exerciseId: input.exerciseId,
          date: input.date,
        });

      case 'log_weight':
        return executeLogWeight(userId, {
          weight: input.weight,
          unit: input.unit,
          date: input.date,
        });

      case 'edit_food':
        return executeEditFood(userId, {
          foodId: input.foodId,
          mealType: input.mealType,
          date: input.date,
          name: input.name,
          calories: input.calories,
          protein: input.protein,
          carbs: input.carbs,
          fat: input.fat,
          servingSize: input.servingSize,
        });

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  }

  private static async getUserSettings(userId: string) {
    try {
      const user = await userService.getUserById(userId);
      return user?.settings;
    } catch {
      return undefined;
    }
  }

  private static async getTodayDiary(userId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const diaryId = `${userId}_${today}`;
      return await diaryService.getDiaryById(diaryId, userId);
    } catch {
      return undefined;
    }
  }

  private static toClaudeMessages(
    messages: Message[]
  ): Anthropic.MessageParam[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  private static async saveMessages(conversationId: string, messages: Message[]): Promise<void> {
    const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
    const doc = await docRef.get();
    const data = doc.data() as Conversation;

    const updatedMessages = [...(data.messages || []), ...messages];

    await docRef.update({
      messages: updatedMessages,
      updatedAt: new Date(),
    });
  }

  private static generateTitle(firstMessage: string): string {
    const maxLength = 30;
    const cleaned = firstMessage.trim().replace(/\n/g, ' ');

    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    return cleaned.substring(0, maxLength - 3) + '...';
  }
}
