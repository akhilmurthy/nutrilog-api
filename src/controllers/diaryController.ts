import { Request, Response, NextFunction } from "express";
import * as diaryService from "../services/diaryService";
import { AuthenticatedRequest } from "../middleware/auth";

const getUserId = (req: Request) => (req as AuthenticatedRequest).userId;

export const createDiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const diary = await diaryService.createDiaryEntry(userId, req.body);
    res.status(201).json(diary);
  } catch (err) {
    next(err);
  }
};

export const replaceDiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const diary = await diaryService.replaceDiaryEntry(req.params.id, req.body);
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};

export const getDiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const diary = await diaryService.getDiaryById(
      req.params.id,
      getUserId(req)
    );
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};

export const deleteDiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await diaryService.deleteDiaryEntry(req.params.id, getUserId(req));
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};


export const addFoodToMeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { diaryId, meal } = req.params;
    const diary = await diaryService.addFoodToMeal(diaryId, meal as any, req.body, userId);
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};

export const removeFoodFromMeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { diaryId, meal, foodId } = req.params;
    const diary = await diaryService.removeFoodFromMeal(diaryId, meal as any, foodId, userId);
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};

export const updateFoodInMeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { diaryId, meal, foodId } = req.params;
    const diary = await diaryService.updateFoodInMeal(diaryId, meal as any, foodId, req.body, userId);
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};

export const addExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { diaryId } = req.params;
    const diary = await diaryService.addExercise(diaryId, req.body, userId);
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};

export const removeExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { diaryId, exerciseId } = req.params;
    const diary = await diaryService.removeExercise(diaryId, exerciseId, userId);
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};
