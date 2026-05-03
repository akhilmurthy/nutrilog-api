import Anthropic from '@anthropic-ai/sdk';

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'log_food',
    description:
      "Log a food item to the user's diary. Use this when the user mentions eating something or wants to track a meal. Estimate nutrition values if not provided. Can log to past dates if user specifies (e.g., 'yesterday', 'last Tuesday', 'April 23rd').",
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Name of the food item',
        },
        calories: {
          type: 'number',
          description: 'Calories in the food item (estimate if not known)',
        },
        protein: {
          type: 'number',
          description: 'Protein in grams',
        },
        carbs: {
          type: 'number',
          description: 'Carbohydrates in grams',
        },
        fat: {
          type: 'number',
          description: 'Fat in grams',
        },
        mealType: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
          description: 'Which meal to log this food to (infer from time of day or context)',
        },
        servingSize: {
          type: 'string',
          description: 'Serving size description (e.g., "1 medium", "100g", "1 cup")',
        },
        date: {
          type: 'string',
          description: 'ISO date string (YYYY-MM-DD) for when the food was eaten. Defaults to today if not specified. Use this for past dates like "yesterday", "last week", etc.',
        },
      },
      required: ['name', 'calories', 'mealType'],
    },
  },
  {
    name: 'log_exercise',
    description:
      "Log an exercise or workout to the user's diary. Use this when the user mentions completing physical activity. Can log to past dates if user specifies.",
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Name of the exercise (e.g., "Running", "Weight Training", "Yoga")',
        },
        caloriesBurned: {
          type: 'number',
          description: 'Estimated calories burned',
        },
        durationMin: {
          type: 'number',
          description: 'Duration in minutes',
        },
        date: {
          type: 'string',
          description: 'ISO date string (YYYY-MM-DD) for when the exercise was done. Defaults to today if not specified.',
        },
      },
      required: ['name', 'caloriesBurned', 'durationMin'],
    },
  },
  {
    name: 'save_memory',
    description:
      'Save an important fact or preference about the user for future reference. Use this when you learn something new about the user that would be helpful to remember (dietary preferences, allergies, injuries, goals, likes/dislikes, schedule, etc.). Duplicates are automatically detected and handled.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: [
            'dietary_preference',
            'food_allergy',
            'health_condition',
            'injury',
            'fitness_goal',
            'schedule',
            'food_like',
            'food_dislike',
            'personal_info',
            'lifestyle',
            'other',
          ],
          description: 'Category of the memory. Use "injury" for physical injuries that affect workouts.',
        },
        content: {
          type: 'string',
          description: 'The fact to remember, written in third person (e.g., "User is vegetarian", "User is allergic to peanuts", "User has a torn ACL in left knee")',
        },
        confidence: {
          type: 'number',
          description: 'How confident you are about this fact (0.0 to 1.0)',
        },
      },
      required: ['category', 'content'],
    },
  },
  {
    name: 'get_memories',
    description:
      'Retrieve stored memories about the user. Use this before creating meal plans or workout plans to check for relevant dietary preferences, allergies, injuries, or health conditions. Can filter by category.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: [
            'dietary_preference',
            'food_allergy',
            'health_condition',
            'injury',
            'fitness_goal',
            'schedule',
            'food_like',
            'food_dislike',
            'personal_info',
            'lifestyle',
            'other',
          ],
          description: 'Optional category to filter memories. If not provided, returns all memories.',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_meal_plan',
    description:
      'Create a personalized meal plan for the user. Use this when the user asks for a meal plan, weekly menu, or food planning. Generate realistic, balanced meals that fit their calorie target and preferences.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Name for the meal plan (e.g., "7-Day High Protein Plan", "Vegetarian Week")',
        },
        description: {
          type: 'string',
          description: 'Brief description of the meal plan',
        },
        calorieTarget: {
          type: 'number',
          description: 'Daily calorie target',
        },
        proteinTarget: {
          type: 'number',
          description: 'Daily protein target in grams',
        },
        carbsTarget: {
          type: 'number',
          description: 'Daily carbs target in grams',
        },
        fatTarget: {
          type: 'number',
          description: 'Daily fat target in grams',
        },
        days: {
          type: 'array',
          description: 'Array of days in the meal plan',
          items: {
            type: 'object',
            properties: {
              dayNumber: {
                type: 'number',
                description: 'Day number (1, 2, 3, etc.)',
              },
              dayName: {
                type: 'string',
                description: 'Name of the day (e.g., "Monday", "Day 1")',
              },
              meals: {
                type: 'object',
                properties: {
                  breakfast: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Meal name (e.g., "Greek Yogurt Parfait")' },
                        description: { type: 'string', description: 'Brief description' },
                        foods: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              calories: { type: 'number' },
                              protein: { type: 'number' },
                              carbs: { type: 'number' },
                              fat: { type: 'number' },
                              servingSize: { type: 'string' },
                            },
                            required: ['name', 'calories', 'protein', 'carbs', 'fat'],
                          },
                        },
                      },
                      required: ['name', 'foods'],
                    },
                  },
                  lunch: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        foods: { type: 'array' },
                      },
                      required: ['name', 'foods'],
                    },
                  },
                  dinner: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        foods: { type: 'array' },
                      },
                      required: ['name', 'foods'],
                    },
                  },
                  snacks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        foods: { type: 'array' },
                      },
                      required: ['name', 'foods'],
                    },
                  },
                },
                required: ['breakfast', 'lunch', 'dinner', 'snacks'],
              },
            },
            required: ['dayNumber', 'meals'],
          },
        },
      },
      required: ['name', 'calorieTarget', 'days'],
    },
  },
  {
    name: 'get_diary',
    description:
      "Get the user's diary for a specific date. Use this to see what foods and exercises are already logged, especially before making edits or removals.",
    input_schema: {
      type: 'object' as const,
      properties: {
        date: {
          type: 'string',
          description: 'ISO date string (YYYY-MM-DD). Defaults to today if not provided.',
        },
      },
      required: [],
    },
  },
  {
    name: 'remove_food',
    description:
      "Remove a food item from the user's diary. Use get_diary first to find the food ID. Use this when the user wants to delete or remove a food entry they logged.",
    input_schema: {
      type: 'object' as const,
      properties: {
        foodId: {
          type: 'string',
          description: 'The ID of the food item to remove (get this from get_diary)',
        },
        mealType: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
          description: 'Which meal the food is in',
        },
        date: {
          type: 'string',
          description: 'ISO date string (YYYY-MM-DD). Defaults to today if not provided.',
        },
      },
      required: ['foodId', 'mealType'],
    },
  },
  {
    name: 'remove_exercise',
    description:
      "Remove an exercise from the user's diary. Use get_diary first to find the exercise ID. Use this when the user wants to delete or remove an exercise entry.",
    input_schema: {
      type: 'object' as const,
      properties: {
        exerciseId: {
          type: 'string',
          description: 'The ID of the exercise to remove (get this from get_diary)',
        },
        date: {
          type: 'string',
          description: 'ISO date string (YYYY-MM-DD). Defaults to today if not provided.',
        },
      },
      required: ['exerciseId'],
    },
  },
  {
    name: 'log_weight',
    description:
      "Log the user's weight. Use this when the user mentions their weight or wants to track a weigh-in.",
    input_schema: {
      type: 'object' as const,
      properties: {
        weight: {
          type: 'number',
          description: 'The weight value',
        },
        unit: {
          type: 'string',
          enum: ['kg', 'lb'],
          description: 'Weight unit (defaults to lb if not specified)',
        },
        date: {
          type: 'string',
          description: 'ISO date string (YYYY-MM-DD). Defaults to today if not provided.',
        },
      },
      required: ['weight'],
    },
  },
  {
    name: 'edit_food',
    description:
      "Edit an existing food entry in the user's diary. Use get_diary first to find the food ID. Use this when the user wants to modify a logged food item (change calories, macros, name, etc.).",
    input_schema: {
      type: 'object' as const,
      properties: {
        foodId: {
          type: 'string',
          description: 'The ID of the food item to edit (get this from get_diary)',
        },
        mealType: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
          description: 'Which meal the food is in',
        },
        date: {
          type: 'string',
          description: 'ISO date string (YYYY-MM-DD). Defaults to today if not provided.',
        },
        name: {
          type: 'string',
          description: 'New name for the food item',
        },
        calories: {
          type: 'number',
          description: 'New calorie value',
        },
        protein: {
          type: 'number',
          description: 'New protein value in grams',
        },
        carbs: {
          type: 'number',
          description: 'New carbs value in grams',
        },
        fat: {
          type: 'number',
          description: 'New fat value in grams',
        },
        servingSize: {
          type: 'string',
          description: 'New serving size description',
        },
      },
      required: ['foodId', 'mealType'],
    },
  },
];
