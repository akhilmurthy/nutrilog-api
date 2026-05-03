// src/services/diaryService.ts
import { db } from "../config/firebase";
import { DiaryDoc, Food, Exercise, MealType } from "../models/diary";
import { FieldValue } from 'firebase-admin/firestore';

const DIARIES_COLLECTION = "diaries";

export const createDiaryEntry = async (
  userId: string | undefined,
  payload: {
    date: string | Date;
    meals?: Partial<DiaryDoc["meals"]>;
    exercises?: DiaryDoc["exercises"];
  }
): Promise<DiaryDoc> => {
  const now = new Date();
  const dateKey = new Date(payload.date).toISOString().split('T')[0];
  const docId = userId ? `${userId}_${dateKey}` : dateKey;

  const doc: DiaryDoc = {
    id: docId,
    userId: userId || '',
    date: new Date(payload.date),
    meals: {
      breakfast: payload.meals?.breakfast ?? [],
      lunch: payload.meals?.lunch ?? [],
      dinner: payload.meals?.dinner ?? [],
      snacks: payload.meals?.snacks ?? [],
    },
    exercises: payload.exercises ?? [],
    createdAt: now,
    updatedAt: now,
  };

  await db.collection(DIARIES_COLLECTION).doc(docId).set(doc);
  return doc;
};

export const getDiaryById = async (id: string, userId?: string): Promise<DiaryDoc> => {
  const doc = await db.collection(DIARIES_COLLECTION).doc(id).get();

  if (!doc.exists) {
    throw new Error("Diary entry not found");
  }

  const diary = doc.data() as DiaryDoc;
  
  if (userId && diary.userId !== userId) {
    throw new Error("Diary entry not found");
  }

  return diary;
};


export const replaceDiaryEntry = async (id: string, diary: DiaryDoc): Promise<DiaryDoc | null> => {
  const docRef = db.collection(DIARIES_COLLECTION).doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return null;
  }

  const updatedDiary = {
    ...diary,
    updatedAt: new Date(),
  };

  await docRef.set(updatedDiary);
  return updatedDiary;
};

export const deleteDiaryEntry = async (id: string, userId?: string): Promise<void> => {
  const docRef = db.collection(DIARIES_COLLECTION).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("Diary entry not found");
  }

  const diary = doc.data() as DiaryDoc;
  
  // Check if userId matches (if provided)
  if (userId && diary.userId !== userId) {
    throw new Error("Diary entry not found");
  }

  await docRef.delete();
};

export const addFoodToMeal = async (
  diaryId: string,
  meal: MealType,
  food: {
    name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  },
  userId?: string
): Promise<DiaryDoc> => {
  const docRef = db.collection(DIARIES_COLLECTION).doc(diaryId);
  const doc = await docRef.get();

  const foodItem: Food = {
    id: Date.now().toString(),
    name: food.name,
    calories: food.calories,
    protein: food.protein ?? 0,
    carbs: food.carbs ?? 0,
    fat: food.fat ?? 0,
  };

  if (!doc.exists) {
    // Create diary on-the-fly when adding first item
    const dateKey = diaryId.includes('_') ? diaryId.split('_').pop()! : diaryId;
    const now = new Date();
    const newDiary: DiaryDoc = {
      id: diaryId,
      userId: userId || '',
      date: new Date(dateKey),
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      },
      exercises: [],
      createdAt: now,
      updatedAt: now,
    };
    newDiary.meals[meal].push(foodItem);
    await docRef.set(newDiary);
    return newDiary;
  }

  const diary = doc.data() as DiaryDoc;

  // Check if userId matches (if provided)
  if (userId && diary.userId !== userId) {
    throw new Error("Diary entry not found");
  }

  await docRef.update({
    [`meals.${meal}`]: FieldValue.arrayUnion(foodItem),
    updatedAt: new Date(),
  });

  // Return updated diary
  const updatedDoc = await docRef.get();
  return updatedDoc.data() as DiaryDoc;
};

export const addExercise = async (
  diaryId: string,
  exercise: {
    name: string;
    calories: number;
    durationMin: number;
  },
  userId?: string
): Promise<DiaryDoc> => {
  const docRef = db.collection(DIARIES_COLLECTION).doc(diaryId);
  const doc = await docRef.get();

  const exerciseItem: Exercise = {
    id: Date.now().toString(),
    name: exercise.name,
    calories: exercise.calories,
    durationMin: exercise.durationMin,
  };

  if (!doc.exists) {
    // Create diary on-the-fly when adding first item
    const dateKey = diaryId.includes('_') ? diaryId.split('_').pop()! : diaryId;
    const now = new Date();
    const newDiary: DiaryDoc = {
      id: diaryId,
      userId: userId || '',
      date: new Date(dateKey),
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      },
      exercises: [exerciseItem],
      createdAt: now,
      updatedAt: now,
    };
    await docRef.set(newDiary);
    return newDiary;
  }

  const diary = doc.data() as DiaryDoc;

  // Check if userId matches (if provided)
  if (userId && diary.userId !== userId) {
    throw new Error("Diary entry not found");
  }

  await docRef.update({
    exercises: FieldValue.arrayUnion(exerciseItem),
    updatedAt: new Date(),
  });

  // Return updated diary
  const updatedDoc = await docRef.get();
  return updatedDoc.data() as DiaryDoc;
};

export const removeExercise = async (
  diaryId: string,
  exerciseId: string,
  userId?: string
): Promise<DiaryDoc> => {
  const docRef = db.collection(DIARIES_COLLECTION).doc(diaryId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("Diary entry not found");
  }

  const diary = doc.data() as DiaryDoc;

  if (userId && diary.userId !== userId) {
    throw new Error("Diary entry not found");
  }

  const updatedExercises = (diary.exercises || []).filter(
    (e) => e.id !== exerciseId
  );

  await docRef.update({
    exercises: updatedExercises,
    updatedAt: new Date(),
  });

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as DiaryDoc;
};

export const removeFoodFromMeal = async (
  diaryId: string,
  meal: MealType,
  foodId: string,
  userId?: string
): Promise<DiaryDoc> => {
  const docRef = db.collection(DIARIES_COLLECTION).doc(diaryId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("Diary entry not found");
  }

  const diary = doc.data() as DiaryDoc;

  if (userId && diary.userId !== userId) {
    throw new Error("Diary entry not found");
  }

  const foods = diary.meals[meal];
  const foodIndex = foods.findIndex((f) => f.id === foodId);

  if (foodIndex === -1) {
    throw new Error("Food item not found");
  }

  foods.splice(foodIndex, 1);

  await docRef.update({
    [`meals.${meal}`]: foods,
    updatedAt: new Date(),
  });

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as DiaryDoc;
};

export const updateFoodInMeal = async (
  diaryId: string,
  meal: MealType,
  foodId: string,
  food: Partial<Food>,
  userId?: string
): Promise<DiaryDoc> => {
  const docRef = db.collection(DIARIES_COLLECTION).doc(diaryId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("Diary entry not found");
  }

  const diary = doc.data() as DiaryDoc;

  if (userId && diary.userId !== userId) {
    throw new Error("Diary entry not found");
  }

  const foods = diary.meals[meal];
  const foodIndex = foods.findIndex((f) => f.id === foodId);

  if (foodIndex === -1) {
    throw new Error("Food item not found");
  }

  foods[foodIndex] = { ...foods[foodIndex], ...food };

  await docRef.update({
    [`meals.${meal}`]: foods,
    updatedAt: new Date(),
  });

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as DiaryDoc;
};
