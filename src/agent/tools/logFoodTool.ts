import * as diaryService from '../../services/diaryService';
import { Food, MealType } from '../../models/diary';

export interface LogFoodInput {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType: MealType;
  servingSize?: string;
  date?: string; // ISO date string YYYY-MM-DD
}

export interface LogFoodResult {
  success: boolean;
  message: string;
  food: Food;
  mealType: MealType;
}

export async function executeLogFood(
  userId: string,
  input: LogFoodInput
): Promise<LogFoodResult> {
  const dateStr = input.date || new Date().toISOString().split('T')[0];
  const diaryId = `${userId}_${dateStr}`;

  const food: Food = {
    name: input.name,
    calories: input.calories,
    protein: input.protein || 0,
    carbs: input.carbs || 0,
    fat: input.fat || 0,
    servingSize: input.servingSize,
  };

  try {
    // Try to get existing diary or create new one
    let diary;
    try {
      diary = await diaryService.getDiaryById(diaryId, userId);
    } catch {
      diary = await diaryService.createDiaryEntry(userId, { date: dateStr });
    }

    // Add food to meal
    await diaryService.addFoodToMeal(diary.id, input.mealType, food, userId);

    const dateLabel = input.date ? ` on ${input.date}` : '';
    return {
      success: true,
      message: `Logged "${input.name}" (${input.calories} cal) to ${input.mealType}${dateLabel}`,
      food,
      mealType: input.mealType,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to log food: ${error.message}`,
      food,
      mealType: input.mealType,
    };
  }
}
