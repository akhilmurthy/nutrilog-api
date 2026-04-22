import { Router } from "express";
import { searchFoodByBarcode, searchFoods } from "../controllers/foodController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/search/barcode/:barcode", searchFoodByBarcode);
router.get("/search", authenticate, searchFoods);

export default router;