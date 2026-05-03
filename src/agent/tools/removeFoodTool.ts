import * as diaryService from '../../services/diaryService';
import { MealType } from '../../models/diary';

export interface RemoveFoodInput {
  foodId: string;
  mealType: MealType;
  date?: string; // ISO date string, defaults to today
}

export interface RemoveFoodResult {
  success: boolean;
  message: string;
}

export async function executeRemoveFood(
  userId: string,
  input: RemoveFoodInput
): Promise<RemoveFoodResult> {
  const dateStr = input.date || new Date().toISOString().split('T')[0];
  const diaryId = `${userId}_${dateStr}`;

  try {
    await diaryService.removeFoodFromMeal(diaryId, input.mealType, input.foodId, userId);

    return {
      success: true,
      message: `Removed food item from ${input.mealType}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to remove food: ${error.message}`,
    };
  }
}
