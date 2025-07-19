import { Router } from "express";
import {
  createDiary,
  replaceDiary,
  getDiary,
  deleteDiary,
} from "../controllers/diaryController";

const router = Router();

router.post("/", createDiary);
router.put("/:id", replaceDiary);
router.get("/:id", getDiary);
router.delete("/:id", deleteDiary);

export default router;
