import { db } from "../config/firebase";
import {
  Recipe,
  Ingredient,
  RecipeStep,
  CreateRecipeInput,
  UpdateRecipeInput,
} from "../models/recipe";

const RECIPES_COLLECTION = "recipes";

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const createRecipe = async (
  userId: string,
  input: CreateRecipeInput
): Promise<Recipe> => {
  const now = new Date();
  const recipeId = generateId();

  const ingredients: Ingredient[] = input.ingredients.map((ing) => ({
    ...ing,
    id: generateId(),
  }));

  const steps: RecipeStep[] = input.steps.map((step, index) => ({
    ...step,
    id: generateId(),
    order: index + 1,
  }));

  const recipe: Recipe = {
    id: recipeId,
    userId,
    name: input.name,
    ingredients,
    steps,
    createdAt: now,
    updatedAt: now,
  };

  // Only add optional fields if they have values (Firestore rejects undefined)
  if (input.description) recipe.description = input.description;
  if (input.imageUrl) recipe.imageUrl = input.imageUrl;
  if (input.yields) recipe.yields = input.yields;

  await db.collection(RECIPES_COLLECTION).doc(recipeId).set(recipe);
  return recipe;
};

export const getRecipes = async (userId: string): Promise<Recipe[]> => {
  const snapshot = await db
    .collection(RECIPES_COLLECTION)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as Recipe);
};

export const getRecipeById = async (
  id: string,
  userId: string
): Promise<Recipe> => {
  const doc = await db.collection(RECIPES_COLLECTION).doc(id).get();

  if (!doc.exists) {
    throw new Error("Recipe not found");
  }

  const recipe = doc.data() as Recipe;

  if (recipe.userId !== userId) {
    throw new Error("Recipe not found");
  }

  return recipe;
};

export const updateRecipe = async (
  id: string,
  userId: string,
  input: UpdateRecipeInput
): Promise<Recipe> => {
  const docRef = db.collection(RECIPES_COLLECTION).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("Recipe not found");
  }

  const recipe = doc.data() as Recipe;

  if (recipe.userId !== userId) {
    throw new Error("Recipe not found");
  }

  const updates: Partial<Recipe> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl;
  if (input.yields !== undefined) updates.yields = input.yields;

  if (input.ingredients !== undefined) {
    updates.ingredients = input.ingredients.map((ing) => ({
      ...ing,
      id: generateId(),
    }));
  }

  if (input.steps !== undefined) {
    updates.steps = input.steps.map((step, index) => ({
      ...step,
      id: generateId(),
      order: index + 1,
    }));
  }

  await docRef.update(updates);

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as Recipe;
};

export const deleteRecipe = async (
  id: string,
  userId: string
): Promise<void> => {
  const docRef = db.collection(RECIPES_COLLECTION).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("Recipe not found");
  }

  const recipe = doc.data() as Recipe;

  if (recipe.userId !== userId) {
    throw new Error("Recipe not found");
  }

  await docRef.delete();
};
