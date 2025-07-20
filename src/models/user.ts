import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: { type: String, trim: true },
    email: { type: String, lowercase: true },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export default model<UserDocument>("User", userSchema);
