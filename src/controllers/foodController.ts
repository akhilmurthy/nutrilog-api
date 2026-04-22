import { Request, Response, NextFunction } from "express";
import { FoodService } from "../services/foodService";
import { AuthenticatedRequest } from "../middleware/auth";

export const searchFoodByBarcode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      res.status(400).json({ error: 'Barcode is required' });
      return;
    }

    console.log('Searching for food by barcode:', barcode);
    
    const foodData = await FoodService.searchByBarcode(barcode);
    res.status(200).json(foodData);
  } catch (error: any) {
    console.error('Error in food controller:', error);
    
    if (error.message === 'Invalid barcode format') {
      res.status(400).json({ error: error.message });
      return;
    }
    
    next(error);
  }
};

export const searchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      res.status(200).json([]);
      return;
    }

    const results = await FoodService.searchFoods(userId, query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching foods:', error);
    next(error);
  }
};