// src/models/diary.ts
import { Schema, model, InferSchemaType } from "mongoose";

/* --- embedded Food schema --- */
const foodSchema = new Schema(
  {
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  { _id: false }
);

const exerciseSchema = new Schema(
  {
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    durationMin: { type: Number, required: true },
  },
  { _id: false }
);

const diarySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },

    date: { type: Date, required: true, unique: true },

    meals: {
      breakfast: { type: [foodSchema], default: [] },
      lunch: { type: [foodSchema], default: [] },
      dinner: { type: [foodSchema], default: [] },
    },

    exercises: { type: [exerciseSchema], default: [] },
  },
  { timestamps: true }
);

export type DiaryDoc = InferSchemaType<typeof diarySchema>;
export const Diary = model<DiaryDoc>("Diary", diarySchema);
