import { MemoryService } from '../services/memoryService';
import { Memory, MemoryCategory } from '../models/memory';

export interface GetMemoriesInput {
  category?: MemoryCategory;
}

export interface GetMemoriesResult {
  success: boolean;
  memories: Memory[];
  message: string;
}

export async function executeGetMemories(
  userId: string,
  input: GetMemoriesInput
): Promise<GetMemoriesResult> {
  try {
    let memories: Memory[];

    if (input.category) {
      memories = await MemoryService.getMemoriesByCategory(userId, input.category);
    } else {
      memories = await MemoryService.getMemories(userId);
    }

    if (memories.length === 0) {
      return {
        success: true,
        memories: [],
        message: input.category
          ? `No memories found in category "${input.category}".`
          : 'No memories found for this user.',
      };
    }

    return {
      success: true,
      memories,
      message: `Found ${memories.length} ${input.category ? `${input.category} ` : ''}memories.`,
    };
  } catch (error: any) {
    return {
      success: false,
      memories: [],
      message: `Failed to retrieve memories: ${error.message}`,
    };
  }
}
