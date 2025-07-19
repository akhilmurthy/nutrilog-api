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
exports.deleteDiary = exports.getDiary = exports.updateDiary = exports.createDiary = void 0;
const diaryService = __importStar(require("../services/diaryService"));
// Diary Controller
const createDiary = async (req, res) => {
    try {
        const diaryData = req.body;
        const result = await diaryService.createDiaryEntry(diaryData);
        res.status(201).json(result);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating diary entry" });
    }
};
exports.createDiary = createDiary;
const updateDiary = async (req, res) => {
    try {
        const { id } = req.params;
        const diaryData = req.body;
        const result = await diaryService.updateDiaryEntry(id, diaryData);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ message: "Error updating diary entry" });
    }
};
exports.updateDiary = updateDiary;
const getDiary = async (req, res) => {
    try {
        const { id } = req.params;
        const diary = await diaryService.getDiaryById(id);
        res.status(200).json(diary);
    }
    catch (err) {
        res.status(500).json({ message: "Error retrieving diary entry" });
    }
};
exports.getDiary = getDiary;
const deleteDiary = async (req, res) => {
    try {
        const { id } = req.params;
        await diaryService.deleteDiaryEntry(id);
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ message: "Error deleting diary entry" });
    }
};
exports.deleteDiary = deleteDiary;
