import { OpenFoodFactsClient } from "../clients/openFoodFactsClient";
import { Food, DiaryDoc } from "../models/diary";
import { db } from "../config/firebase";

const DIARIES_COLLECTION = "diaries";

export interface SearchResult extends Food {
  source: 'history' | 'database';
}

export class FoodService {
  static async searchByBarcode(barcode: string): Promise<Food> {
    try {
      // Validate barcode format
      if (!this.isValidBarcode(barcode)) {
        throw new Error('Invalid barcode format');
      }

      // Get raw data from Open Food Facts
      const rawData = await OpenFoodFactsClient.getProductByBarcode(barcode);
      
      // Parse into our Food model
      return this.parseOpenFoodFactsData(rawData, barcode);
    } catch (error) {
      console.error('Error in food service:', error);
      throw error;
    }
  }

  private static parseOpenFoodFactsData(rawData: any, barcode: string): Food {
    if (!rawData || !rawData.product || rawData.status !== 1) {
      throw new Error('Product not found in food database');
    }

    const product = rawData.product;
    const nutriments = product.nutriments || {};

    // Convert energy from kJ to kcal (divide by ~4.184)
    const energyKcal = nutriments['energy-kcal_100g'] || 
                      (nutriments['energy-kj_100g'] ? Math.round(nutriments['energy-kj_100g'] / 4.184) : 0);

    // Parse dietary analysis
    const analysis = product.ingredients_analysis || {};
    const isVegan = !analysis['en:non-vegan']?.length && !analysis['en:maybe-vegan']?.length;
    const isVegetarian = !analysis['en:non-vegetarian']?.length;
    const containsPalmOil = analysis['en:palm-oil']?.length > 0;

    const food: Food = {
      name: product.product_name || `Product ${barcode}`,
      calories: Math.round(energyKcal),
      protein: Math.round(nutriments['proteins_100g'] || 0),
      carbs: Math.round(nutriments['carbohydrates_100g'] || 0),
      fat: Math.round(nutriments['fat_100g'] || 0),
      
      // Additional nutrients
      fiber: nutriments['fiber_100g'] ? Math.round(nutriments['fiber_100g'] * 10) / 10 : undefined,
      sugars: nutriments['sugars_100g'] ? Math.round(nutriments['sugars_100g'] * 10) / 10 : undefined,
      saturatedFat: nutriments['saturated-fat_100g'] ? Math.round(nutriments['saturated-fat_100g'] * 10) / 10 : undefined,
      sodium: nutriments['sodium_100g'] ? Math.round(nutriments['sodium_100g'] * 1000) / 1000 : undefined, // in grams
      salt: nutriments['salt_100g'] ? Math.round(nutriments['salt_100g'] * 1000) / 1000 : undefined,
      
      // Product metadata
      brand: product.brands || undefined,
      barcode,
      servingSize: "per 100g",
      category: product.categories?.split(',')[0]?.trim() || undefined,
      imageUrl: product.image_front_url || undefined,
      
      // Nutritional scores
      nutriScore: product.nutriscore_grade?.toUpperCase() || undefined,
      novaGroup: product.nova_group || undefined,
      
      // Dietary flags
      isVegan: analysis['en:non-vegan'] ? false : (analysis['en:vegan-status-unknown'] ? undefined : isVegan),
      isVegetarian: analysis['en:non-vegetarian'] ? false : (analysis['en:vegetarian-status-unknown'] ? undefined : isVegetarian),
      containsPalmOil,
      
      // Additional info
      ingredientsText: product.ingredients_text || undefined,
      allergens: product.allergens_tags || undefined,
    };

    console.log('Parsed food data:', food);
    return food;
  }

  private static isValidBarcode(barcode: string): boolean {
    // Basic validation - should be numeric and appropriate length
    const cleanBarcode = barcode.replace(/\s/g, '');
    return /^\d{8,14}$/.test(cleanBarcode) && cleanBarcode.length >= 8;
  }

  static async searchFoods(userId: string, query: string): Promise<SearchResult[]> {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery || lowerQuery.length < 2) return [];

    // Search both sources in parallel
    const [userFoods, offResults] = await Promise.all([
      this.searchUserHistory(userId, lowerQuery),
      this.searchOpenFoodFacts(lowerQuery),
    ]);

    // Combine results: user history first, then database
    return [...userFoods, ...offResults].slice(0, 20);
  }

  private static async searchUserHistory(userId: string, query: string): Promise<SearchResult[]> {
    try {
      const snapshot = await db.collection(DIARIES_COLLECTION)
        .where('userId', '==', userId)
        .get();

      const foodMap = new Map<string, SearchResult>();

      snapshot.docs.forEach(doc => {
        const diary = doc.data() as DiaryDoc;
        const meals = diary.meals || {};
        const allFoods = [
          ...(Array.isArray(meals.breakfast) ? meals.breakfast : []),
          ...(Array.isArray(meals.lunch) ? meals.lunch : []),
          ...(Array.isArray(meals.dinner) ? meals.dinner : []),
          ...(Array.isArray(meals.snacks) ? meals.snacks : []),
        ];

        allFoods.forEach(food => {
          if (!food?.name) return;
          const foodKey = food.name.toLowerCase();
          if (foodKey.includes(query) && !foodMap.has(foodKey)) {
            foodMap.set(foodKey, { ...food, source: 'history' });
          }
        });
      });

      return Array.from(foodMap.values()).slice(0, 10);
    } catch (error) {
      console.error('Error searching user history:', error);
      return [];
    }
  }

  private static async searchOpenFoodFacts(query: string): Promise<SearchResult[]> {
    try {
      const rawData = await OpenFoodFactsClient.searchByText(query, 10);

      if (!rawData?.products?.length) return [];

      return rawData.products
        .filter((p: any) => p.product_name)
        .map((product: any): SearchResult => {
          const nutriments = product.nutriments || {};
          const energyKcal = nutriments['energy-kcal_100g'] ||
            (nutriments['energy-kj_100g'] ? Math.round(nutriments['energy-kj_100g'] / 4.184) : 0);

          return {
            name: product.product_name,
            brand: product.brands || undefined,
            calories: Math.round(energyKcal),
            protein: Math.round(nutriments['proteins_100g'] || 0),
            carbs: Math.round(nutriments['carbohydrates_100g'] || 0),
            fat: Math.round(nutriments['fat_100g'] || 0),
            barcode: product.code || undefined,
            imageUrl: product.image_front_url || undefined,
            servingSize: 'per 100g',
            source: 'database',
          };
        });
    } catch (error) {
      console.error('Error searching Open Food Facts:', error);
      return [];
    }
  }
}