import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { MealPlanService } from '../services/mealPlanService';

export const listMealPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    const mealPlans = await MealPlanService.getMealPlans(userId);

    res.status(200).json(mealPlans);
  } catch (error) {
    console.error('Error in listMealPlans:', error);
    next(error);
  }
};

export const getMealPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    const mealPlan = await MealPlanService.getMealPlan(id, userId);

    res.status(200).json(mealPlan);
  } catch (error: any) {
    console.error('Error in getMealPlan:', error);

    if (error.message === 'Meal plan not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
      return;
    }

    next(error);
  }
};

export const getActiveMealPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    const mealPlan = await MealPlanService.getActiveMealPlan(userId);

    if (!mealPlan) {
      res.status(404).json({ error: 'No active meal plan' });
      return;
    }

    res.status(200).json(mealPlan);
  } catch (error) {
    console.error('Error in getActiveMealPlan:', error);
    next(error);
  }
};

export const updateMealPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;
    const updates = req.body;

    const mealPlan = await MealPlanService.updateMealPlan(id, userId, updates);

    res.status(200).json(mealPlan);
  } catch (error: any) {
    console.error('Error in updateMealPlan:', error);

    if (error.message === 'Meal plan not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
      return;
    }

    next(error);
  }
};

export const deleteMealPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    await MealPlanService.deleteMealPlan(id, userId);

    res.status(204).send();
  } catch (error: any) {
    console.error('Error in deleteMealPlan:', error);

    if (error.message === 'Meal plan not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
      return;
    }

    next(error);
  }
};

export const activateMealPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    const mealPlan = await MealPlanService.activateMealPlan(id, userId);

    res.status(200).json(mealPlan);
  } catch (error: any) {
    console.error('Error in activateMealPlan:', error);

    if (error.message === 'Meal plan not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
      return;
    }

    next(error);
  }
};

export const logMealPlanDay = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id, dayNumber } = req.params;
    const { date } = req.body;

    const result = await MealPlanService.logMealPlanDay(id, userId, {
      dayNumber: parseInt(dayNumber, 10),
      date,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in logMealPlanDay:', error);

    if (error.message === 'Meal plan not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message.includes('not found in meal plan')) {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
      return;
    }

    next(error);
  }
};
