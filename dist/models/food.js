"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Food = void 0;
const mongoose_1 = require("mongoose");
const foodSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    calories: {
        type: Number,
        required: true,
    },
    protein: {
        type: Number,
    },
    carbs: {
        type: Number,
    },
    fat: {
        type: Number,
    },
});
exports.Food = (0, mongoose_1.model)("Food", foodSchema);
