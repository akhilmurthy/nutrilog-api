import { Router } from "express";
import {
  createUser,
  getMyUser,
  updateMyUser,
  deleteMyUser,
} from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, createUser);

router
  .route("/me")
  .all(authenticate)
  .get(getMyUser)
  .patch(updateMyUser)
  .delete(deleteMyUser);

export default router;
