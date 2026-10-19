
import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./db.js";
import "./models/Issue.js";
import issueRoutes from "./routes/issueRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import logger from "./utils/logger.js";
import { validateEnv } from "./config/validateEnv.js";

dotenv.config();
validateEnv();

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const OLLAMA_URL =
    process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";


app.use((req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
        logger.info("HTTP request completed", {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            durationMs: Date.now() - startTime,
        });
    });

    next();
});

app.use(express.json({ limit: "100kb" }));
app.use("/api/auth", authRoutes);
app.use("/api/issues", authenticateToken, issueRoutes);

// 1. Health-check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Mini Tracking Tool backend is running",
    });
});

// 2. AI issue-summary API
// app.post("/api/ai/summarize", async (req, res) => {
app.post("/api/ai/summarize", authenticateToken, async (req, res) => {
    const { issueDescription } = req.body ?? {};

    if (
        typeof issueDescription !== "string" ||
        issueDescription.trim().length === 0
    ) {
        return res.status(400).json({
            success: false,
            message: "issueDescription is required",
        });
    }

    if (issueDescription.length > 6000) {
        return res.status(400).json({
            success: false,
            message: "issueDescription must not exceed 6000 characters",
        });
    }

    const prompt = `
You are a helpful software issue-tracking assistant.
Summarize the following issue in 2-3 concise sentences.
Include the main problem and its impact.
Do not invent facts that are not provided.

Issue description:
${issueDescription}
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            // console.error("Ollama returned HTTP status:", response.status);
            logger.error("Ollama returned an unsuccessful HTTP status", {
                status: response.status,
            });

            return res.status(502).json({
                success: false,
                message: "The AI service could not process the request",
            });
        }

        const result = await response.json();

        // if (typeof result.response !== "string") {
        //   return res.status(502).json({
        //     success: false,
        //     message: "The AI service returned an unexpected response",
        //   });
        // }
        if (
            typeof result.response !== "string" ||
            result.response.trim().length === 0
        ) {
            return res.status(502).json({
                success: false,
                message: "The AI service returned an empty or invalid summary",
            });
        }

        return res.status(200).json({
            success: true,
            model: OLLAMA_MODEL,
            summary: result.response.trim(),
        });
        //   } catch (error) {
        //     console.error("AI request failed:", error.message);

        //     return res.status(502).json({
        //       success: false,
        //       message: "Could not connect to the AI service. Check that Ollama is running.",
        //     });
        //   } finally {
        //     clearTimeout(timeout);
        //   }
    } catch (error) {
        // console.error("AI request failed:", error.message);
        logger.error("AI request failed", {
            error: error.message,
        });

        if (error.name === "AbortError") {
            return res.status(504).json({
                success: false,
                message: "The AI service request timed out. Please try again.",
            });
        }

        return res.status(502).json({
            success: false,
            message: "Could not connect to the AI service. Check that Ollama is running.",
        });
    } finally {
        clearTimeout(timeout);
    }
});

// Handle invalid JSON and other Express errors
// app.use((err, req, res, next) => {
//     if (err instanceof SyntaxError && "body" in err) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid JSON request body",
//         });
//     }

//     console.error("Server error:", err.message);

//     return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//     });
// });


 // Handle invalid JSON and other Express errors
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && "body" in err) {
        logger.warn("Invalid JSON request body", {
            method: req.method,
            path: req.originalUrl,
        });

        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body",
        });
    }

    logger.error("Unhandled server error", {
        method: req.method,
        path: req.originalUrl,
        error: err.message,
    });

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});


// Listen only on this computer for local development
// app.listen(PORT, "127.0.0.1", () => {
//   console.log(`Backend running at http://127.0.0.1:${PORT}`);
// });


async function startServer() {
    try {
        await sequelize.authenticate();
        // console.log("PostgreSQL connection successful");
        logger.info("PostgreSQL connection successful");

        // Creates the issues table if it does not exist.
        // Suitable for this learning project; use migrations
        // rather than sync for production schema changes.
        await sequelize.sync();

        // console.log("Database tables are ready");
        logger.info("Database tables are ready");

        app.listen(PORT, "127.0.0.1", () => {
            // console.log(
            //     `Backend running at http://127.0.0.1:${PORT}`
            // );
            logger.info("Backend server started", {
                url: `http://127.0.0.1:${PORT}`,
            });
        });
    } catch (error) {
        // console.error("Failed to start the application:", error.message);
        logger.error("Failed to start the application", {
            error: error.message,
        });
        process.exitCode = 1;
    }
}

startServer();