import { db } from '../../config/firebase';
import { Memory, MemoryEntry, UserMemories, CreateMemoryInput, MemoryCategory } from '../models/memory';

// Store all memories in a single document per user: memories/{userId}
const MEMORIES_COLLECTION = 'memories';

export class MemoryService {
  // Get the user's memory document (or create empty one)
  private static async getUserMemoriesDoc(userId: string): Promise<UserMemories> {
    const docRef = db.collection(MEMORIES_COLLECTION).doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        userId,
        memories: [],
        updatedAt: new Date(),
      };
    }

    return doc.data() as UserMemories;
  }

  static async getMemories(userId: string, activeOnly = true): Promise<Memory[]> {
    const userMemories = await this.getUserMemoriesDoc(userId);

    let memories = userMemories.memories;

    if (activeOnly) {
      memories = memories.filter((m) => m.isActive);
    }

    // Sort by createdAt desc and add userId to each entry
    return memories
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .map((m) => ({ ...m, userId }));
  }

  static async getMemoriesByCategory(
    userId: string,
    category: MemoryCategory,
    activeOnly = true
  ): Promise<Memory[]> {
    const allMemories = await this.getMemories(userId, activeOnly);
    return allMemories.filter((m) => m.category === category);
  }

  static findSimilarInList(
    memories: MemoryEntry[],
    category: MemoryCategory,
    content: string
  ): MemoryEntry | null {
    const normalizedContent = content.toLowerCase().trim();

    for (const memory of memories) {
      if (memory.category !== category || !memory.isActive) continue;

      const normalizedMemory = memory.content.toLowerCase().trim();

      // Exact match
      if (normalizedMemory === normalizedContent) {
        return memory;
      }

      // One contains the other
      if (
        normalizedMemory.includes(normalizedContent) ||
        normalizedContent.includes(normalizedMemory)
      ) {
        return memory;
      }

      // High word overlap (>70%)
      const contentWords = new Set(normalizedContent.split(/\s+/));
      const memoryWords = new Set(normalizedMemory.split(/\s+/));
      const intersection = [...contentWords].filter((word) => memoryWords.has(word));
      const similarity = intersection.length / Math.max(contentWords.size, memoryWords.size);

      if (similarity > 0.7) {
        return memory;
      }
    }

    return null;
  }

  static async createMemory(userId: string, input: CreateMemoryInput): Promise<Memory> {
    const docRef = db.collection(MEMORIES_COLLECTION).doc(userId);
    const userMemories = await this.getUserMemoriesDoc(userId);
    const now = new Date();

    // Check for duplicates
    const similar = this.findSimilarInList(userMemories.memories, input.category, input.content);

    if (similar) {
      const newConfidence = input.confidence || 0.8;
      const shouldUpdate =
        newConfidence > similar.confidence || input.content.length > similar.content.length;

      if (shouldUpdate) {
        // Update existing memory
        const updatedMemories = userMemories.memories.map((m) =>
          m.id === similar.id
            ? { ...m, content: input.content, confidence: newConfidence, updatedAt: now }
            : m
        );

        await docRef.set({
          userId,
          memories: updatedMemories,
          updatedAt: now,
        });

        return { ...similar, content: input.content, confidence: newConfidence, userId };
      }

      // Return existing without update
      return { ...similar, userId };
    }

    // Create new memory entry
    const newMemory: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      category: input.category,
      content: input.content,
      source: 'conversation',
      sourceConversationId: input.sourceConversationId,
      confidence: input.confidence || 0.8,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set({
      userId,
      memories: [...userMemories.memories, newMemory],
      updatedAt: now,
    });

    return { ...newMemory, userId };
  }

  static async updateMemory(
    memoryId: string,
    userId: string,
    updates: Partial<Pick<MemoryEntry, 'content' | 'isActive'>>
  ): Promise<void> {
    const docRef = db.collection(MEMORIES_COLLECTION).doc(userId);
    const userMemories = await this.getUserMemoriesDoc(userId);
    const now = new Date();

    const memoryIndex = userMemories.memories.findIndex((m) => m.id === memoryId);

    if (memoryIndex === -1) {
      throw new Error('Memory not found');
    }

    const updatedMemories = [...userMemories.memories];
    updatedMemories[memoryIndex] = {
      ...updatedMemories[memoryIndex],
      ...updates,
      updatedAt: now,
    };

    await docRef.set({
      userId,
      memories: updatedMemories,
      updatedAt: now,
    });
  }

  static async deleteMemory(memoryId: string, userId: string): Promise<void> {
    const docRef = db.collection(MEMORIES_COLLECTION).doc(userId);
    const userMemories = await this.getUserMemoriesDoc(userId);
    const now = new Date();

    const filteredMemories = userMemories.memories.filter((m) => m.id !== memoryId);

    if (filteredMemories.length === userMemories.memories.length) {
      throw new Error('Memory not found');
    }

    await docRef.set({
      userId,
      memories: filteredMemories,
      updatedAt: now,
    });
  }
}
