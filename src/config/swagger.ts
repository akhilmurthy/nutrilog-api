import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nutrilog API',
      version: '1.0.0',
      description: 'API for nutrition tracking and diary management',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // User schemas from userService and models
        UserSettings: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
              description: 'Display name for the user',
            },
            weightUnit: {
              type: 'string',
              enum: ['kg', 'lb'],
              description: 'Preferred weight unit',
            },
            calorieGoal: {
              type: 'number',
              description: 'Daily calorie goal',
            },
            avatarUrl: {
              type: 'string',
              description: 'URL to user avatar image',
            },
          },
        },
        UserDocument: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'Unique user ID',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date-time',
              description: 'User date of birth',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'User gender',
            },
            settings: {
              $ref: '#/components/schemas/UserSettings',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['userId', 'settings'],
        },
        CreateUserRequest: {
          type: 'object',
          properties: {
            settings: {
              $ref: '#/components/schemas/UserSettings',
            },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
            },
            weightUnit: {
              type: 'string',
              enum: ['kg', 'lb'],
            },
            calorieGoal: {
              type: 'number',
            },
            avatarUrl: {
              type: 'string',
            },
          },
        },
        // Food schemas from foodService and models
        Food: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique food ID',
            },
            name: {
              type: 'string',
              description: 'Food name',
              example: 'Nutella',
            },
            calories: {
              type: 'number',
              description: 'Calories per 100g',
              example: 539,
            },
            protein: {
              type: 'number',
              description: 'Protein in grams per 100g',
              example: 6.3,
            },
            carbs: {
              type: 'number',
              description: 'Carbohydrates in grams per 100g',
              example: 57.5,
            },
            fat: {
              type: 'number',
              description: 'Fat in grams per 100g',
              example: 30.9,
            },
            fiber: {
              type: 'number',
              description: 'Fiber in grams per 100g',
            },
            sugars: {
              type: 'number',
              description: 'Sugars in grams per 100g',
            },
            saturatedFat: {
              type: 'number',
              description: 'Saturated fat in grams per 100g',
            },
            sodium: {
              type: 'number',
              description: 'Sodium in grams per 100g',
            },
            salt: {
              type: 'number',
              description: 'Salt in grams per 100g',
            },
            brand: {
              type: 'string',
              description: 'Food brand',
              example: 'Ferrero',
            },
            barcode: {
              type: 'string',
              description: 'Product barcode',
              example: '3017620425400',
            },
            servingSize: {
              type: 'string',
              description: 'Serving size description',
              example: 'per 100g',
            },
            category: {
              type: 'string',
              description: 'Food category',
            },
            imageUrl: {
              type: 'string',
              description: 'Product image URL',
            },
            nutriScore: {
              type: 'string',
              description: 'Nutri-Score grade (A-E)',
              example: 'E',
            },
            novaGroup: {
              type: 'number',
              description: 'NOVA processing group (1-4)',
              example: 4,
            },
            isVegan: {
              type: 'boolean',
              description: 'Whether the food is vegan',
            },
            isVegetarian: {
              type: 'boolean',
              description: 'Whether the food is vegetarian',
            },
            containsPalmOil: {
              type: 'boolean',
              description: 'Whether the food contains palm oil',
            },
            ingredientsText: {
              type: 'string',
              description: 'Ingredients list',
            },
            allergens: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of allergens',
            },
          },
          required: ['name', 'calories', 'protein', 'carbs', 'fat'],
        },
        // Food request schema from addFoodToMeal service
        AddFoodToMealRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Food name',
              example: 'Oatmeal',
            },
            calories: {
              type: 'number',
              description: 'Calories',
              example: 150,
            },
            protein: {
              type: 'number',
              description: 'Protein in grams',
              example: 5,
            },
            carbs: {
              type: 'number',
              description: 'Carbohydrates in grams',
              example: 30,
            },
            fat: {
              type: 'number',
              description: 'Fat in grams',
              example: 3,
            },
          },
          required: ['name', 'calories'],
        },
        // Exercise schemas from diaryService
        Exercise: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique exercise ID',
            },
            name: {
              type: 'string',
              description: 'Exercise name',
              example: 'Running',
            },
            calories: {
              type: 'number',
              description: 'Calories burned',
              example: 300,
            },
            durationMin: {
              type: 'number',
              description: 'Duration in minutes',
              example: 30,
            },
          },
          required: ['name', 'calories', 'durationMin'],
        },
        // Meals schema as separate reference
        Meals: {
          type: 'object',
          properties: {
            breakfast: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Food',
              },
              description: 'Breakfast foods',
            },
            lunch: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Food',
              },
              description: 'Lunch foods',
            },
            dinner: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Food',
              },
              description: 'Dinner foods',
            },
          },
          required: ['breakfast', 'lunch', 'dinner'],
        },
        // Diary schemas from diaryService
        DiaryDoc: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique diary ID (format: userId_YYYY-MM-DD)',
              example: 'user123_2024-01-15',
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this diary',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date of the diary entry',
            },
            meals: {
              $ref: '#/components/schemas/Meals',
            },
            exercises: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Exercise',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['id', 'userId', 'date', 'meals', 'exercises'],
        },
        // Create diary request schema from createDiaryEntry service
        CreateDiaryRequest: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date for the diary entry',
              example: '2024-01-15T00:00:00Z',
            },
            meals: {
              type: 'object',
              properties: {
                breakfast: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Food',
                  },
                },
                lunch: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Food',
                  },
                },
                dinner: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Food',
                  },
                },
              },
            },
            exercises: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Exercise',
              },
            },
          },
          required: ['date'],
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const specs = swaggerJSDoc(options);