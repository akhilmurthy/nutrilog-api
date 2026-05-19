import { Router } from "express";
import {
  createRecipe,
  getRecipes,
  getRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipeController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Recipes
 *     description: Recipe management operations
 */

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     description: Creates a new recipe for the authenticated user.
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ingredients
 *               - steps
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Classic Pancakes"
 *               description:
 *                 type: string
 *                 example: "Fluffy homemade pancakes"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/pancakes.jpg"
 *               yields:
 *                 type: string
 *                 example: "12 pancakes"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "All-purpose flour"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     unit:
 *                       type: string
 *                       example: "cups"
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     instruction:
 *                       type: string
 *                       example: "Mix dry ingredients in a large bowl"
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all recipes
 *     description: Retrieves all recipes for the authenticated user.
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized
 */
router.post("/", createRecipe);
router.get("/", getRecipes);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     description: Retrieves a specific recipe by ID. The recipe must belong to the authenticated user.
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe details
 *       404:
 *         description: Recipe not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update recipe
 *     description: Updates an existing recipe. The recipe must belong to the authenticated user.
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               yields:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     instruction:
 *                       type: string
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       404:
 *         description: Recipe not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete recipe
 *     description: Deletes a recipe. The recipe must belong to the authenticated user.
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     responses:
 *       204:
 *         description: Recipe deleted successfully
 *       404:
 *         description: Recipe not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", getRecipe);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);

export default router;
