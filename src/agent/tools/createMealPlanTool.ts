import { MealPlanService } from '../services/mealPlanService';
import { MealPlan, MealPlanDay, PlannedMeal } from '../models/mealPlan';

export interface CreateMealPlanToolInput {
  name: string;
  description?: string;
  calorieTarget: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  days: {
    dayNumber: number;
    dayName?: string;
    meals: {
      breakfast: PlannedMealInput[];
      lunch: PlannedMealInput[];
      dinner: PlannedMealInput[];
      snacks: PlannedMealInput[];
    };
  }[];
}

interface PlannedMealInput {
  name: string;
  description?: string;
  foods: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize?: string;
  }[];
}

export interface CreateMealPlanResult {
  success: boolean;
  message: string;
  mealPlan?: MealPlan;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calculateTotals(foods: { calories: number; protein: number; carbs: number; fat: number }[]): {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
} {
  return foods.reduce(
    (acc, food) => ({
      totalCalories: acc.totalCalories + food.calories,
      totalProtein: acc.totalProtein + food.protein,
      totalCarbs: acc.totalCarbs + food.carbs,
      totalFat: acc.totalFat + food.fat,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );
}

function transformPlannedMeal(meal: PlannedMealInput): PlannedMeal {
  const foods = meal.foods.map((f) => ({
    id: generateId(),
    name: f.name,
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fat: f.fat,
    servingSize: f.servingSize,
  }));

  const totals = calculateTotals(foods);

  return {
    id: generateId(),
    name: meal.name,
    description: meal.description,
    foods,
    ...totals,
  };
}

function transformDay(dayInput: CreateMealPlanToolInput['days'][0]): MealPlanDay {
  const meals = {
    breakfast: dayInput.meals.breakfast.map(transformPlannedMeal),
    lunch: dayInput.meals.lunch.map(transformPlannedMeal),
    dinner: dayInput.meals.dinner.map(transformPlannedMeal),
    snacks: dayInput.meals.snacks.map(transformPlannedMeal),
  };

  // Calculate day totals from PlannedMeal objects
  const allMeals = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snacks];
  const totals = allMeals.reduce(
    (acc, meal) => ({
      totalCalories: acc.totalCalories + meal.totalCalories,
      totalProtein: acc.totalProtein + meal.totalProtein,
      totalCarbs: acc.totalCarbs + meal.totalCarbs,
      totalFat: acc.totalFat + meal.totalFat,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );

  return {
    dayNumber: dayInput.dayNumber,
    dayName: dayInput.dayName,
    meals,
    ...totals,
  };
}

export async function executeCreateMealPlan(
  userId: string,
  input: CreateMealPlanToolInput
): Promise<CreateMealPlanResult> {
  try {
    // Transform input days to proper MealPlanDay format
    const days = input.days.map(transformDay);

    const mealPlan = await MealPlanService.createMealPlan(
      userId,
      {
        name: input.name,
        description: input.description,
        days: input.days.length,
        calorieTarget: input.calorieTarget,
        proteinTarget: input.proteinTarget,
        carbsTarget: input.carbsTarget,
        fatTarget: input.fatTarget,
      },
      days,
      'ai'
    );

    return {
      success: true,
      message: `Created ${input.days.length}-day meal plan "${input.name}" with ${input.calorieTarget} calorie daily target`,
      mealPlan,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to create meal plan: ${error.message}`,
    };
  }
}
