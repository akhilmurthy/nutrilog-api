import { Request, Response, NextFunction } from "express";
import * as recipeService from "../services/recipeService";
import { AuthenticatedRequest } from "../middleware/auth";

const getUserId = (req: Request): string => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
};

export const createRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const recipe = await recipeService.createRecipe(userId, req.body);
    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
};

export const getRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const recipes = await recipeService.getRecipes(userId);
    res.status(200).json(recipes);
  } catch (err) {
    next(err);
  }
};

export const getRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const recipe = await recipeService.getRecipeById(req.params.id, userId);
    res.status(200).json(recipe);
  } catch (err) {
    next(err);
  }
};

export const updateRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const recipe = await recipeService.updateRecipe(
      req.params.id,
      userId,
      req.body
    );
    res.status(200).json(recipe);
  } catch (err) {
    next(err);
  }
};

export const deleteRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    await recipeService.deleteRecipe(req.params.id, userId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
