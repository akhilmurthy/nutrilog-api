import { db } from '../../config/firebase';
import {
  MealPlan,
  MealPlanDay,
  PlannedMeal,
  CreateMealPlanInput,
  UpdateMealPlanInput,
  LogMealPlanDayInput,
} from '../models/mealPlan';
import { MealType } from '../../models/diary';
import * as diaryService from '../../services/diaryService';

const MEAL_PLANS_COLLECTION = 'mealPlans';

export class MealPlanService {
  static async getMealPlans(userId: string): Promise<MealPlan[]> {
    const snapshot = await db
      .collection(MEAL_PLANS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      ...(doc.data() as MealPlan),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
    }));
  }

  static async getMealPlan(planId: string, userId: string): Promise<MealPlan> {
    const doc = await db.collection(MEAL_PLANS_COLLECTION).doc(planId).get();

    if (!doc.exists) {
      throw new Error('Meal plan not found');
    }

    const plan = doc.data() as MealPlan;
    if (plan.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return {
      ...plan,
      id: doc.id,
      createdAt: (plan.createdAt as any)?.toDate?.() || new Date(plan.createdAt),
      updatedAt: (plan.updatedAt as any)?.toDate?.() || new Date(plan.updatedAt),
    };
  }

  static async getActiveMealPlan(userId: string): Promise<MealPlan | null> {
    const snapshot = await db
      .collection(MEAL_PLANS_COLLECTION)
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const plan = doc.data() as MealPlan;
    return {
      ...plan,
      id: doc.id,
      createdAt: (plan.createdAt as any)?.toDate?.() || new Date(plan.createdAt),
      updatedAt: (plan.updatedAt as any)?.toDate?.() || new Date(plan.updatedAt),
    };
  }

  static async createMealPlan(
    userId: string,
    input: CreateMealPlanInput,
    days: MealPlanDay[],
    generatedBy: 'ai' | 'manual' = 'manual'
  ): Promise<MealPlan> {
    const now = new Date();

    const plan: Omit<MealPlan, 'id'> = {
      userId,
      name: input.name,
      description: input.description,
      days,
      calorieTarget: input.calorieTarget,
      proteinTarget: input.proteinTarget,
      carbsTarget: input.carbsTarget,
      fatTarget: input.fatTarget,
      isActive: false,
      generatedBy,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(MEAL_PLANS_COLLECTION).add(plan);

    return { ...plan, id: docRef.id };
  }

  static async updateMealPlan(
    planId: string,
    userId: string,
    updates: UpdateMealPlanInput
  ): Promise<MealPlan> {
    const docRef = db.collection(MEAL_PLANS_COLLECTION).doc(planId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Meal plan not found');
    }

    const plan = doc.data() as MealPlan;
    if (plan.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await docRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    const updatedDoc = await docRef.get();
    const updatedPlan = updatedDoc.data() as MealPlan;
    return {
      ...updatedPlan,
      id: updatedDoc.id,
      createdAt: (updatedPlan.createdAt as any)?.toDate?.() || new Date(updatedPlan.createdAt),
      updatedAt: (updatedPlan.updatedAt as any)?.toDate?.() || new Date(updatedPlan.updatedAt),
    };
  }

  static async deleteMealPlan(planId: string, userId: string): Promise<void> {
    const docRef = db.collection(MEAL_PLANS_COLLECTION).doc(planId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Meal plan not found');
    }

    const plan = doc.data() as MealPlan;
    if (plan.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await docRef.delete();
  }

  static async activateMealPlan(planId: string, userId: string): Promise<MealPlan> {
    // Deactivate all other meal plans for this user
    const existingPlans = await db
      .collection(MEAL_PLANS_COLLECTION)
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    const batch = db.batch();
    existingPlans.docs.forEach((doc) => {
      batch.update(doc.ref, { isActive: false, updatedAt: new Date() });
    });

    // Activate the specified plan
    const planRef = db.collection(MEAL_PLANS_COLLECTION).doc(planId);
    const planDoc = await planRef.get();

    if (!planDoc.exists) {
      throw new Error('Meal plan not found');
    }

    const plan = planDoc.data() as MealPlan;
    if (plan.userId !== userId) {
      throw new Error('Unauthorized');
    }

    batch.update(planRef, { isActive: true, updatedAt: new Date() });

    await batch.commit();

    return this.getMealPlan(planId, userId);
  }

  static async logMealPlanDay(
    planId: string,
    userId: string,
    input: LogMealPlanDayInput
  ): Promise<{ success: boolean; diaryId: string; itemsLogged: number }> {
    const plan = await this.getMealPlan(planId, userId);
    const day = plan.days.find((d) => d.dayNumber === input.dayNumber);

    if (!day) {
      throw new Error(`Day ${input.dayNumber} not found in meal plan`);
    }

    const dateStr = input.date || new Date().toISOString().split('T')[0];
    const diaryId = `${userId}_${dateStr}`;

    // Get or create diary for this date
    let diary;
    try {
      diary = await diaryService.getDiaryById(diaryId, userId);
    } catch {
      diary = await diaryService.createDiaryEntry(userId, { date: dateStr });
    }

    // Log all foods from the meal plan day
    let itemsLogged = 0;
    const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

    for (const mealType of mealTypes) {
      const plannedMeals = day.meals[mealType];
      for (const plannedMeal of plannedMeals) {
        for (const food of plannedMeal.foods) {
          await diaryService.addFoodToMeal(diaryId, mealType, food, userId);
          itemsLogged++;
        }
      }
    }

    return {
      success: true,
      diaryId,
      itemsLogged,
    };
  }
}
