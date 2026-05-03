"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFoodInMeal = exports.removeFoodFromMeal = exports.removeExercise = exports.addExercise = exports.addFoodToMeal = exports.deleteDiaryEntry = exports.replaceDiaryEntry = exports.getDiaryById = exports.createDiaryEntry = void 0;
// src/services/diaryService.ts
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const DIARIES_COLLECTION = "diaries";
const createDiaryEntry = async (userId, payload) => {
    const now = new Date();
    const dateKey = new Date(payload.date).toISOString().split('T')[0];
    const docId = userId ? `${userId}_${dateKey}` : dateKey;
    const doc = {
        id: docId,
        userId: userId || '',
        date: new Date(payload.date),
        meals: {
            breakfast: payload.meals?.breakfast ?? [],
            lunch: payload.meals?.lunch ?? [],
            dinner: payload.meals?.dinner ?? [],
            snacks: payload.meals?.snacks ?? [],
        },
        exercises: payload.exercises ?? [],
        createdAt: now,
        updatedAt: now,
    };
    await firebase_1.db.collection(DIARIES_COLLECTION).doc(docId).set(doc);
    return doc;
};
exports.createDiaryEntry = createDiaryEntry;
const getDiaryById = async (id, userId) => {
    const doc = await firebase_1.db.collection(DIARIES_COLLECTION).doc(id).get();
    if (!doc.exists) {
        throw new Error("Diary entry not found");
    }
    const diary = doc.data();
    if (userId && diary.userId !== userId) {
        throw new Error("Diary entry not found");
    }
    return diary;
};
exports.getDiaryById = getDiaryById;
const replaceDiaryEntry = async (id, diary) => {
    const docRef = firebase_1.db.collection(DIARIES_COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    const updatedDiary = {
        ...diary,
        updatedAt: new Date(),
    };
    await docRef.set(updatedDiary);
    return updatedDiary;
};
exports.replaceDiaryEntry = replaceDiaryEntry;
const deleteDiaryEntry = async (id, userId) => {
    const docRef = firebase_1.db.collection(DIARIES_COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error("Diary entry not found");
    }
    const diary = doc.data();
    // Check if userId matches (if provided)
    if (userId && diary.userId !== userId) {
        throw new Error("Diary entry not found");
    }
    await docRef.delete();
};
exports.deleteDiaryEntry = deleteDiaryEntry;
const addFoodToMeal = async (diaryId, meal, food, userId) => {
    const docRef = firebase_1.db.collection(DIARIES_COLLECTION).doc(diaryId);
    const doc = await docRef.get();
    const foodItem = {
        id: Date.now().toString(),
        name: food.name,
        calories: food.calories,
        protein: food.protein ?? 0,
        carbs: food.carbs ?? 0,
        fat: food.fat ?? 0,
    };
    if (!doc.exists) {
        // Create diary on-the-fly when adding first item
        const dateKey = diaryId.includes('_') ? diaryId.split('_').pop() : diaryId;
        const now = new Date();
        const newDiary = {
            id: diaryId,
            userId: userId || '',
            date: new Date(dateKey),
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: [],
            },
            exercises: [],
            createdAt: now,
            updatedAt: now,
        };
        newDiary.meals[meal].push(foodItem);
        await docRef.set(newDiary);
        return newDiary;
    }
    const diary = doc.data();
    // Check if userId matches (if provided)
    if (userId && diary.userId !== userId) {
        throw new Error("Diary entry not found");
    }
    await docRef.update({
        [`meals.${meal}`]: firestore_1.FieldValue.arrayUnion(foodItem),
        updatedAt: new Date(),
    });
    // Return updated diary
    const updatedDoc = await docRef.get();
    return updatedDoc.data();
};
exports.addFoodToMeal = addFoodToMeal;
const addExercise = async (diaryId, exercise, userId) => {
    const docRef = firebase_1.db.collection(DIARIES_COLLECTION).doc(diaryId);
    const doc = await docRef.get();
    const exerciseItem = {
        id: Date.now().toString(),
        name: exercise.name,
        calories: exercise.calories,
        durationMin: exercise.durationMin,
    };
    if (!doc.exists) {
        // Create diary on-the-fly when adding first item
        const dateKey = diaryId.includes('_') ? diaryId.split('_').pop() : diaryId;
        const now = new Date();
        const newDiary = {
            id: diaryId,
            userId: userId || '',
            date: new Date(dateKey),
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: [],
            },
            exercises: [exerciseItem],
            createdAt: now,
            updatedAt: now,
        };
        await docRef.set(newDiary);
        return newDiary;
    }
    const diary = doc.data();
    // Check if userId matches (if provided)
    if (userId && diary.userId !== userId) {
        throw new Error("Diary entry not found");
    }
    await docRef.update({
        exercises: firestore_1.FieldValue.arrayUnion(exerciseItem),
        updatedAt: new Date(),
    });
    // Return updated diary
    const updatedDoc = await docRef.get();
    return updatedDoc.data();
};
exports.addExercise = addExercise;
const removeExercise = async (diaryId, exerciseId, userId) => {
    const docRef = firebase_1.db.collection(DIARIES_COLLECTION).doc(diaryId);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error("Diary entry not found");
    }
    const diary = doc.data();
    if (userId && diary.userId !== userId) {
        throw new Error("Diary entry not found");
    }
    const updatedExercises = (diary.exercises || []).filter((e) => e.id !== exerciseId);
    await docRef.update({
        exercises: updatedExercises,
        updatedAt: new Date(),
    });
    const updatedDoc = await docRef.get();
    return updatedDoc.data();
};
exports.removeExercise = removeExercise;
const removeFoodFromMeal = async (diaryId, meal, foodId, userId) => {
    const docRef = firebase_1.db.collection(DIARIES_COLLECTION).doc(diaryId);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error("Diary entry not found");
    }
    const diary = doc.data();
    if (userId && diary.userId !== userId) {
        throw new Error("Diary entry not found");
    }
    const foods = diary.meals[meal];
    const foodIndex = foods.findIndex((f) => f.id === foodId);
    if (foodIndex === -1) {
        throw new Error("Food item not found");
    }
    foods.splice(foodIndex, 1);
    await docRef.update({
        [`meals.${meal}`]: foods,
        updatedAt: new Date(),
    });
    const updatedDoc = await docRef.get();
    return updatedDoc.data();
};
exports.removeFoodFromMeal = removeFoodFromMeal;
const updateFoodInMeal = async (diaryId, meal, foodId, food, userId) => {
    const docRef = firebase_1.db.collection(DIARIES_COLLECTION).doc(diaryId);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error("Diary entry not found");
    }
    const diary = doc.data();
    if (userId && diary.userId !== userId) {
        throw new Error("Diary entry not found");
    }
    const foods = diary.meals[meal];
    const foodIndex = foods.findIndex((f) => f.id === foodId);
    if (foodIndex === -1) {
        throw new Error("Food item not found");
    }
    foods[foodIndex] = { ...foods[foodIndex], ...food };
    await docRef.update({
        [`meals.${meal}`]: foods,
        updatedAt: new Date(),
    });
    const updatedDoc = await docRef.get();
    return updatedDoc.data();
};
exports.updateFoodInMeal = updateFoodInMeal;
