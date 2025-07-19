"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFoodToMeal = exports.deleteDiaryEntry = exports.getDiaryById = exports.updateDiaryEntry = exports.createDiaryEntry = void 0;
const diary_1 = require("../models/diary");
const food_1 = require("../models/food");
// Create a new diary entry
const createDiaryEntry = async (data) => {
    try {
        const { date, meals } = data; // expect date and meals (breakfast, lunch, dinner)
        // Ensure meals is an object with the necessary properties
        const diaryEntry = new diary_1.Diary({
            date,
            meals: {
                breakfast: meals?.breakfast || [],
                lunch: meals?.lunch || [],
                dinner: meals?.dinner || [],
            },
        });
        const savedDiary = await diaryEntry.save();
        return savedDiary;
    }
    catch (error) {
        throw new Error("Error creating diary entry: " + error);
    }
};
exports.createDiaryEntry = createDiaryEntry;
// Update a specific diary entry
const updateDiaryEntry = async (id, data) => {
    try {
        const { meals } = data; // expect updated meals data
        // Find and update the diary entry by id
        const updatedDiary = await diary_1.Diary.findByIdAndUpdate(id, {
            meals: {
                breakfast: meals?.breakfast || [],
                lunch: meals?.lunch || [],
                dinner: meals?.dinner || [],
            },
        }, { new: true });
        if (!updatedDiary) {
            throw new Error("Diary entry not found");
        }
        return updatedDiary;
    }
    catch (error) {
        throw new Error("Error updating diary entry: " + error);
    }
};
exports.updateDiaryEntry = updateDiaryEntry;
// Get a specific diary entry by its ID
const getDiaryById = async (id) => {
    try {
        const diary = await diary_1.Diary.findById(id).populate("meals.breakfast meals.lunch meals.dinner");
        if (!diary) {
            throw new Error("Diary entry not found");
        }
        // Ensure meals is initialized
        if (!diary.meals) {
            diary.meals = {
                breakfast: [],
                lunch: [],
                dinner: [],
            };
        }
        return diary;
    }
    catch (error) {
        throw new Error("Error retrieving diary entry: " + error);
    }
};
exports.getDiaryById = getDiaryById;
const deleteDiaryEntry = async (id) => {
    try {
        const deletedDiary = await diary_1.Diary.findByIdAndDelete(id);
        if (!deletedDiary) {
            throw new Error("Diary entry not found");
        }
    }
    catch (error) {
        throw new Error("Error deleting diary entry: " + error);
    }
};
exports.deleteDiaryEntry = deleteDiaryEntry;
const addFoodToMeal = async (diaryId, meal, foodData) => {
    try {
        const diary = await diary_1.Diary.findById(diaryId);
        if (!diary) {
            throw new Error("Diary entry not found");
        }
        if (!diary.meals) {
            diary.meals = {
                breakfast: [],
                lunch: [],
                dinner: [],
            };
        }
        if (!diary.meals[meal]) {
            diary.meals[meal] = [];
        }
        const newFood = new food_1.Food(foodData);
        const savedFood = await newFood.save();
        diary.meals[meal].push(savedFood._id);
        await diary.save();
        return diary;
    }
    catch (error) {
        throw new Error("Error adding food to meal: " + error);
    }
};
exports.addFoodToMeal = addFoodToMeal;
