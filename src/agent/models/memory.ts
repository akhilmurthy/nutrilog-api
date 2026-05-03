export type MemoryCategory =
  | 'dietary_preference'
  | 'food_allergy'
  | 'health_condition'
  | 'injury'
  | 'fitness_goal'
  | 'schedule'
  | 'food_like'
  | 'food_dislike'
  | 'personal_info'
  | 'lifestyle'
  | 'other';

export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  content: string;
  source: 'conversation' | 'manual';
  sourceConversationId?: string;
  confidence: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Single document per user containing all their memories
export interface UserMemories {
  userId: string;
  memories: MemoryEntry[];
  updatedAt: Date;
}

// Keep old interface as alias for backwards compatibility
export type Memory = MemoryEntry & { userId: string };

export interface CreateMemoryInput {
  category: MemoryCategory;
  content: string;
  confidence?: number;
  sourceConversationId?: string;
}
