import { Schema, model, InferSchemaType } from "mongoose";

const foodSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
  },
  carbs: {
    type: Number,
  },
  fat: {
    type: Number,
  },
});

export const Food = model("Food", foodSchema);
export type FoodDoc = InferSchemaType<typeof foodSchema>;
