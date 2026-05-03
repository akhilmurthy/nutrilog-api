import { MealType, Food } from '../../models/diary';

export interface PlannedMeal {
  id: string;
  name: string;
  description?: string;
  foods: Food[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealPlanDay {
  dayNumber: number; // 1-7 for a week, or 1-N for custom
  dayName?: string; // "Monday", "Day 1", etc.
  meals: {
    breakfast: PlannedMeal[];
    lunch: PlannedMeal[];
    dinner: PlannedMeal[];
    snacks: PlannedMeal[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  days: MealPlanDay[];
  calorieTarget: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  isActive: boolean;
  generatedBy: 'ai' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMealPlanInput {
  name: string;
  description?: string;
  days: number; // How many days to generate
  calorieTarget: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  preferences?: string; // User preferences like "high protein", "vegetarian", etc.
}

export interface UpdateMealPlanInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface LogMealPlanDayInput {
  dayNumber: number;
  date?: string; // ISO date string, defaults to today
}
