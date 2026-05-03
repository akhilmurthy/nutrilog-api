// src/app.ts
import dotenv from "dotenv";
dotenv.config(); // Must be called before other imports that use env vars

import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";

// Initialize Firebase (this will set up the connection)
import "./config/firebase";
import diaryRoutes from "./routes/diaryRoutes";
import userRoutes from "./routes/userRoutes";
import foodRoutes from "./routes/foodRoutes";
import { agentRoutes } from "./agent";

function startServer() {
  const app = express();

  // CORS - allow all origins
  app.use(cors());
  app.use(bodyParser.json());

  // Request/Response logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    console.log(`→ ${req.method} ${req.url}`);
    if (Object.keys(req.body || {}).length > 0) {
      console.log("  Body:", JSON.stringify(req.body));
    }

    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`← ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
    });

    next();
  });

  // Swagger API documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Nutrilog API Documentation"
  }));

  app.use("/api/diaries", diaryRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/food", foodRoutes);
  app.use("/api/agent", agentRoutes);

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "Nutrition Tracker API started successfully",
      documentation: "/api-docs"
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response, next: NextFunction) => {
    if (!res.headersSent) {
      res.status(404).json({ message: "Route not found" });
    } else {
      next();
    }
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message || "Something went wrong!" });
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

startServer();
