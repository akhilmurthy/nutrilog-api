"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Must be called before other imports that use env vars
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
// Initialize Firebase (this will set up the connection)
require("./config/firebase");
const diaryRoutes_1 = __importDefault(require("./routes/diaryRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const foodRoutes_1 = __importDefault(require("./routes/foodRoutes"));
const agent_1 = require("./agent");
function startServer() {
    const app = (0, express_1.default)();
    // CORS - allow all origins
    app.use((0, cors_1.default)());
    app.use(body_parser_1.default.json());
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
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Nutrilog API Documentation"
    }));
    app.use("/api/diaries", diaryRoutes_1.default);
    app.use("/api/users", userRoutes_1.default);
    app.use("/api/food", foodRoutes_1.default);
    app.use("/api/agent", agent_1.agentRoutes);
    app.get("/", (_req, res) => {
        res.json({
            message: "Nutrition Tracker API started successfully",
            documentation: "/api-docs"
        });
    });
    // 404 handler
    app.use((_req, res, next) => {
        if (!res.headersSent) {
            res.status(404).json({ message: "Route not found" });
        }
        else {
            next();
        }
    });
    // Error handler
    app.use((err, _req, res, _next) => {
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
