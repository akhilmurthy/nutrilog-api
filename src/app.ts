// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import { connectDB } from "./clients/mongoClient.js"; // note .js
import diaryRoutes from "./routes/diaryRoutes.js";

dotenv.config();

async function startServer() {
  await connectDB();

  const app = express();
  app.use(bodyParser.json());

  app.use("/api/diaries", diaryRoutes);

  app.get("/", (_req: Request, res: Response) => {
    res.send("Nutrition Tracker API is running...");
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  });

  const PORT = Number(process.env.PORT) || 8000;
  const server = app.listen(PORT, () => {
    console.log(`🚀  Server running on port ${PORT}`);
  });

  const stop = () => server.close(() => process.exit(0));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  server.on("close", () => console.log("🔌  HTTP server closed"));
  server.on("error", (err) => console.error("💥 server error", err));
}

startServer().catch((err) => {
  console.error("❌  Failed to start server:", err);
  process.exit(1);
});
