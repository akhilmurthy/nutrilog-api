import { Router } from "express";
import {
  createDiary,
  replaceDiary,
  getDiary,
  deleteDiary,
  addFoodToMeal,
  removeFoodFromMeal,
  updateFoodInMeal,
  addExercise,
  removeExercise,
} from "../controllers/diaryController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Diary Management
 *     description: Core diary CRUD operations
 *   - name: Meal Management
 *     description: Adding and managing food items in meals
 */

/**
 * @swagger
 * /api/diaries:
 *   post:
 *     summary: Create a new diary entry
 *     description: Creates a new diary entry for the authenticated user. The diary ID is automatically generated using the format userId_YYYY-MM-DD.
 *     tags: [Diary Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDiaryRequest'
 *     responses:
 *       201:
 *         description: Diary entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryDoc'
 *       401:
 *         description: Unauthorized
 */
router.post("/", createDiary);

/**
 * @swagger
 * /api/diaries/{id}:
 *   get:
 *     summary: Get diary entry by ID
 *     description: Retrieves a specific diary entry by ID. The diary must belong to the authenticated user.
 *     tags: [Diary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary ID (format userId_YYYY-MM-DD)
 *         example: "user123_2024-01-15"
 *     responses:
 *       200:
 *         description: Diary entry details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryDoc'
 *       404:
 *         description: Diary entry not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Replace diary entry
 *     description: Completely replaces an existing diary entry. The diary must belong to the authenticated user.
 *     tags: [Diary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary ID (format userId_YYYY-MM-DD)
 *         example: "user123_2024-01-15"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiaryDoc'
 *     responses:
 *       200:
 *         description: Diary entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryDoc'
 *       404:
 *         description: Diary entry not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete diary entry
 *     description: Deletes a diary entry. The diary must belong to the authenticated user.
 *     tags: [Diary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary ID (format userId_YYYY-MM-DD)
 *         example: "user123_2024-01-15"
 *     responses:
 *       204:
 *         description: Diary entry deleted successfully
 *       404:
 *         description: Diary entry not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", replaceDiary);
router.get("/:id", getDiary);
router.delete("/:id", deleteDiary);

/**
 * @swagger
 * /api/diaries/{diaryId}/meals/{meal}:
 *   post:
 *     summary: Add food item to a specific meal
 *     description: Adds a food item to the specified meal in the diary. The food item receives an auto-generated ID and default values for optional nutritional fields. The diary must belong to the authenticated user.
 *     tags: [Meal Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary ID (format userId_YYYY-MM-DD)
 *         example: "user123_2024-01-15"
 *       - in: path
 *         name: meal
 *         required: true
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snacks]
 *         description: Meal type to add food to
 *         example: "breakfast"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFoodToMealRequest'
 *     responses:
 *       200:
 *         description: Food item added to meal successfully, returns updated diary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryDoc'
 *       404:
 *         description: Diary entry not found or doesn't belong to user
 *       401:
 *         description: Unauthorized
 */
router.post("/:diaryId/meals/:meal", addFoodToMeal);

/**
 * @swagger
 * /api/diaries/{diaryId}/meals/{meal}/foods/{foodId}:
 *   delete:
 *     summary: Remove food item from a meal
 *     description: Removes a specific food item from the specified meal. The diary must belong to the authenticated user.
 *     tags: [Meal Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary ID (format userId_YYYY-MM-DD)
 *         example: "user123_2024-01-15"
 *       - in: path
 *         name: meal
 *         required: true
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snacks]
 *         description: Meal type
 *         example: "breakfast"
 *       - in: path
 *         name: foodId
 *         required: true
 *         schema:
 *           type: string
 *         description: Food item ID
 *         example: "1704067200000"
 *     responses:
 *       200:
 *         description: Food item removed successfully, returns updated diary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryDoc'
 *       404:
 *         description: Diary entry or food item not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update food item in a meal
 *     description: Updates a specific food item in the specified meal. The diary must belong to the authenticated user.
 *     tags: [Meal Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary ID (format userId_YYYY-MM-DD)
 *         example: "user123_2024-01-15"
 *       - in: path
 *         name: meal
 *         required: true
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snacks]
 *         description: Meal type
 *         example: "breakfast"
 *       - in: path
 *         name: foodId
 *         required: true
 *         schema:
 *           type: string
 *         description: Food item ID
 *         example: "1704067200000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFoodToMealRequest'
 *     responses:
 *       200:
 *         description: Food item updated successfully, returns updated diary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryDoc'
 *       404:
 *         description: Diary entry or food item not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:diaryId/meals/:meal/foods/:foodId", removeFoodFromMeal);
router.put("/:diaryId/meals/:meal/foods/:foodId", updateFoodInMeal);

/**
 * @swagger
 * /api/diaries/{diaryId}/exercises:
 *   post:
 *     summary: Add exercise to diary
 *     tags: [Meal Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               calories:
 *                 type: number
 *               durationMin:
 *                 type: number
 *     responses:
 *       200:
 *         description: Exercise added successfully
 */
router.post("/:diaryId/exercises", addExercise);

/**
 * @swagger
 * /api/diaries/{diaryId}/exercises/{exerciseId}:
 *   delete:
 *     summary: Remove exercise from diary
 *     tags: [Meal Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercise removed successfully
 */
router.delete("/:diaryId/exercises/:exerciseId", removeExercise);

export default router;
