import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let cached = (global as any)._mongoose as typeof mongoose | undefined;

export const connectDB = async () => {
  if (cached) {
    return cached;
  }

  const uri = process.env.MONGO_URI as string;
  if (!uri) throw new Error("Missing MONGO_URI env var");

  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB || "nutrilog",
  });

  console.log("MongoDB connected");
  cached = mongoose;
  (global as any)._mongoose = cached;
  return cached;
};
