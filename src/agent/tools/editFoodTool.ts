import * as diaryService from '../../services/diaryService';
import { MealType } from '../../models/diary';

export interface EditFoodInput {
  foodId: string;
  mealType: MealType;
  date?: string; // ISO date string YYYY-MM-DD
  // Fields to update (all optional)
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
}

export interface EditFoodResult {
  success: boolean;
  message: string;
}

export async function executeEditFood(
  userId: string,
  input: EditFoodInput
): Promise<EditFoodResult> {
  try {
    const dateStr = input.date || new Date().toISOString().split('T')[0];
    const diaryId = `${userId}_${dateStr}`;

    // Build update object with only provided fields
    const updates: Record<string, any> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.calories !== undefined) updates.calories = input.calories;
    if (input.protein !== undefined) updates.protein = input.protein;
    if (input.carbs !== undefined) updates.carbs = input.carbs;
    if (input.fat !== undefined) updates.fat = input.fat;
    if (input.servingSize !== undefined) updates.servingSize = input.servingSize;

    if (Object.keys(updates).length === 0) {
      return {
        success: false,
        message: 'No fields to update',
      };
    }

    await diaryService.updateFoodInMeal(
      diaryId,
      input.mealType,
      input.foodId,
      updates,
      userId
    );

    return {
      success: true,
      message: `Updated ${input.name || 'food item'} in ${input.mealType}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to edit food: ${error.message}`,
    };
  }
}
