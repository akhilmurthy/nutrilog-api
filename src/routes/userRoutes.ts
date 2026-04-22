import { Router } from "express";
import {
  createUser,
  getMyUser,
  updateMyUser,
  deleteMyUser,
  getMyDiaryByDate,
  addWeightEntry,
  getWeightHistory,
  updateWeightEntry,
  deleteWeightEntry,
} from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: User account management endpoints
 *   - name: User Diaries
 *     description: User-scoped diary operations
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDocument'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, createUser);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user details
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDocument'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *   patch:
 *     summary: Update current user settings
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDocument'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete current user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/me")
  .all(authenticate)
  .get(getMyUser)
  .patch(updateMyUser)
  .delete(deleteMyUser);

/**
 * @swagger
 * /api/users/me/diaries/date/{date}:
 *   get:
 *     summary: Get user's diary for a specific date
 *     description: Retrieves or creates a diary entry for the authenticated user on the specified date. If no diary exists for that date, a new empty diary will be created automatically.
 *     tags: [User Diaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: "2024-01-15"
 *     responses:
 *       200:
 *         description: Diary entry for the specified date (created if it didn't exist)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryDoc'
 *       401:
 *         description: Unauthorized
 */
router.get("/me/diaries/date/:date", authenticate, getMyDiaryByDate);

/**
 * @swagger
 * /api/users/me/weights:
 *   get:
 *     summary: Get weight history
 *     description: Retrieves the authenticated user's weight entries, ordered by date descending.
 *     tags: [User Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Maximum number of entries to return
 *     responses:
 *       200:
 *         description: Weight history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WeightEntry'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Add weight entry
 *     description: Records a new weight entry for the authenticated user.
 *     tags: [User Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weight
 *             properties:
 *               weight:
 *                 type: number
 *                 description: Weight value
 *                 example: 75.5
 *               unit:
 *                 type: string
 *                 enum: [kg, lb]
 *                 default: kg
 *                 description: Unit of measurement
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of measurement (defaults to today)
 *     responses:
 *       201:
 *         description: Weight entry created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeightEntry'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router
  .route("/me/weights")
  .all(authenticate)
  .get(getWeightHistory)
  .post(addWeightEntry);

/**
 * @swagger
 * /api/users/me/weights/{entryId}:
 *   put:
 *     summary: Update weight entry
 *     description: Updates a specific weight entry for the authenticated user.
 *     tags: [User Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The weight entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weight
 *             properties:
 *               weight:
 *                 type: number
 *                 description: Weight value
 *               unit:
 *                 type: string
 *                 enum: [kg, lb]
 *     responses:
 *       200:
 *         description: Weight entry updated
 *       404:
 *         description: Weight entry not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete weight entry
 *     description: Deletes a specific weight entry for the authenticated user.
 *     tags: [User Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The weight entry ID
 *     responses:
 *       204:
 *         description: Weight entry deleted
 *       404:
 *         description: Weight entry not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/me/weights/:entryId")
  .all(authenticate)
  .put(updateWeightEntry)
  .delete(deleteWeightEntry);

export default router;
