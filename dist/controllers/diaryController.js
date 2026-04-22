"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeExercise = exports.addExercise = exports.updateFoodInMeal = exports.removeFoodFromMeal = exports.addFoodToMeal = exports.deleteDiary = exports.getDiary = exports.replaceDiary = exports.createDiary = void 0;
const diaryService = __importStar(require("../services/diaryService"));
const getUserId = (req) => req.userId;
const createDiary = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const diary = await diaryService.createDiaryEntry(userId, req.body);
        res.status(201).json(diary);
    }
    catch (err) {
        next(err);
    }
};
exports.createDiary = createDiary;
const replaceDiary = async (req, res, next) => {
    try {
        const diary = await diaryService.replaceDiaryEntry(req.params.id, req.body);
        res.status(200).json(diary);
    }
    catch (err) {
        next(err);
    }
};
exports.replaceDiary = replaceDiary;
const getDiary = async (req, res, next) => {
    try {
        const diary = await diaryService.getDiaryById(req.params.id, getUserId(req));
        res.status(200).json(diary);
    }
    catch (err) {
        next(err);
    }
};
exports.getDiary = getDiary;
const deleteDiary = async (req, res, next) => {
    try {
        await diaryService.deleteDiaryEntry(req.params.id, getUserId(req));
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteDiary = deleteDiary;
const addFoodToMeal = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { diaryId, meal } = req.params;
        const diary = await diaryService.addFoodToMeal(diaryId, meal, req.body, userId);
        res.status(200).json(diary);
    }
    catch (err) {
        next(err);
    }
};
exports.addFoodToMeal = addFoodToMeal;
const removeFoodFromMeal = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { diaryId, meal, foodId } = req.params;
        const diary = await diaryService.removeFoodFromMeal(diaryId, meal, foodId, userId);
        res.status(200).json(diary);
    }
    catch (err) {
        next(err);
    }
};
exports.removeFoodFromMeal = removeFoodFromMeal;
const updateFoodInMeal = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { diaryId, meal, foodId } = req.params;
        const diary = await diaryService.updateFoodInMeal(diaryId, meal, foodId, req.body, userId);
        res.status(200).json(diary);
    }
    catch (err) {
        next(err);
    }
};
exports.updateFoodInMeal = updateFoodInMeal;
const addExercise = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { diaryId } = req.params;
        const diary = await diaryService.addExercise(diaryId, req.body, userId);
        res.status(200).json(diary);
    }
    catch (err) {
        next(err);
    }
};
exports.addExercise = addExercise;
const removeExercise = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { diaryId, exerciseId } = req.params;
        const diary = await diaryService.removeExercise(diaryId, exerciseId, userId);
        res.status(200).json(diary);
    }
    catch (err) {
        next(err);
    }
};
exports.removeExercise = removeExercise;
