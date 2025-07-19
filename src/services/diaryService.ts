// src/services/diaryService.ts
import { Diary, DiaryDoc } from "../models/diary";
import { Food, FoodDoc } from "../models/food";
import mongoose from "mongoose";
import { Types } from "mongoose";

type MealKey = "breakfast" | "lunch" | "dinner";

export const createDiaryEntry = async (
  userId: string | undefined,
  payload: {
    date: string | Date;
    meals?: Partial<DiaryDoc["meals"]>;
    exercises?: DiaryDoc["exercises"];
  }
) => {
  const doc: any = {
    date: payload.date,
    meals: {
      breakfast: payload.meals?.breakfast ?? [],
      lunch: payload.meals?.lunch ?? [],
      dinner: payload.meals?.dinner ?? [],
    },
    exercises: payload.exercises ?? [],
  };

  if (userId && Types.ObjectId.isValid(userId)) {
    doc.user = new Types.ObjectId(userId);
  }

  const diary = await Diary.create(doc);
  return diary.populate("meals.breakfast meals.lunch meals.dinner");
};

export const getDiaryById = async (id: string, userId?: string) => {
  const qry = Diary.findById(id);

  if (userId) qry.where("user").equals(userId);

  const diary = await qry.populate("meals.breakfast meals.lunch meals.dinner");

  if (!diary) throw new Error("Diary entry not found");
  return diary;
};

export const replaceDiaryEntry = (id: string, diary: DiaryDoc) =>
  Diary.findByIdAndUpdate(id, diary, {
    new: true,
    overwrite: true,
    runValidators: true,
  });

export const deleteDiaryEntry = async (id: string, userId?: string) => {
  const res = await Diary.findOneAndDelete({
    _id: id,
    ...(userId ? { user: userId } : {}),
  });
  if (!res) throw new Error("Diary entry not found");
};

export const addFoodToMeal = async (
  diaryId: string,
  meal: MealKey,
  food: {
    name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  },
  userId?: string
) => {
  const foodDoc = await Food.create(food);
  const foodId: Types.ObjectId = foodDoc._id;

  const diary = await Diary.findOneAndUpdate(
    { _id: diaryId, ...(userId ? { user: userId } : {}) },
    { $push: { [`meals.${meal}`]: foodId } },
    { new: true, runValidators: true }
  ).populate(`meals.${meal}`);

  if (!diary) throw new Error("Diary entry not found");
  return diary;
};

export const addExercise = async (
  diaryId: string,
  exercise: {
    name: string;
    calories: number;
    durationMin: number;
  },
  userId?: string
) => {
  const diary = await Diary.findOneAndUpdate(
    { _id: diaryId, ...(userId ? { user: userId } : {}) },
    { $push: { exercises: exercise } },
    { new: true, runValidators: true }
  );

  if (!diary) throw new Error("Diary entry not found");
  return diary;
};
