"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diary = void 0;
const mongoose_1 = require("mongoose");
const diarySchema = new mongoose_1.Schema({
    date: {
        type: Date,
        required: true,
    },
    meals: {
        breakfast: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Food" }],
        lunch: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Food" }],
        dinner: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Food" }],
    },
});
exports.Diary = (0, mongoose_1.model)("Diary", diarySchema);
