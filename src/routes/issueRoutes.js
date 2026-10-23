import { Router } from "express";
import Issue from "../models/Issue.js";
import { requireRole } from "../middleware/authMiddleware.js";
import { issueAiSummaryRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();

// CREATE an issue
router.post("/", async (req, res) => {
    try {
        const { title, description, priority } = req.body ?? {};

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof description !== "string" ||
            !description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required",
            });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: "Title must not exceed 200 characters",
            });
        }

        const allowedPriorities = ["Low", "Medium", "High", "Critical"];

        if (priority !== undefined && !allowedPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Priority must be Low, Medium, High, or Critical",
            });
        }

        const issue = await Issue.create({
            title: title.trim(),
            description: description.trim(),
            priority: priority ?? "Medium",
            createdBy: Number(req.user.id),
        });

        return res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: issue,
        });
    } catch (error) {
        console.error("Create issue failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to create issue",
        });
    }
});

// READ all issues
router.get("/", async (req, res) => {
    try {
        const where =
            req.user.role === "Admin"
                ? {}
                : { createdBy: Number(req.user.id) };

        const issues = await Issue.findAll({
            where,
            order: [["createdAt", "DESC"]],
        });


        return res.status(200).json({
            success: true,
            count: issues.length,
            data: issues,
        });
    } catch (error) {
        console.error("Fetch issues failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch issues",
        });
    }
});

// READ one issue by ID
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Issue ID must be a positive integer",
            });
        }

        const where =
            req.user.role === "Admin"
                ? { id }
                : { id, createdBy: Number(req.user.id) };

        const issue = await Issue.findOne({ where });


        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: issue,
        });
    } catch (error) {
        console.error("Fetch issue failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch issue",
        });
    }
});

// UPDATE an issue
router.patch("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Issue ID must be a positive integer",
            });
        }

        const where =
            req.user.role === "Admin"
                ? { id }
                : { id, createdBy: Number(req.user.id) };

        const issue = await Issue.findOne({ where });


        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const { title, description, status, priority } = req.body ?? {};
        const updates = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim() || title.trim().length > 200) {
                return res.status(400).json({
                    success: false,
                    message: "Title must be a non-empty string of at most 200 characters",
                });
            }
            updates.title = title.trim();
        }

        if (description !== undefined) {
            if (typeof description !== "string" || !description.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Description must be a non-empty string",
                });
            }
            updates.description = description.trim();
        }

        if (status !== undefined) {
            if (!["Open", "In Progress", "Resolved", "Closed"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status",
                });
            }
            updates.status = status;
        }

        if (priority !== undefined) {
            if (!["Low", "Medium", "High", "Critical"].includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid priority",
                });
            }
            updates.priority = priority;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one valid field to update",
            });
        }

        await issue.update(updates);

        return res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: issue,
        });
    } catch (error) {
        console.error("Update issue failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update issue",
        });
    }
});

// DELETE an issue
// router.delete("/:id", async (req, res) => {
router.delete("/:id", requireRole("Admin"), async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Issue ID must be a positive integer",
            });
        }

        const issue = await Issue.findByPk(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        await issue.destroy();

        return res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
        });
    } catch (error) {
        console.error("Delete issue failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to delete issue",
        });
    }
});


// AI summary for an issue saved in PostgreSQL
router.post("/:id/ai-summary", issueAiSummaryRateLimiter, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Issue ID must be a positive integer",
            });
        }

        // Step 1: Retrieve the issue from PostgreSQL
        // const issue = await Issue.findByPk(id);

        // Step 1: Retrieve the issue with ownership restrictions
        const where =
            req.user.role === "Admin"
                ? { id }
                : {
                    id,
                    createdBy: Number(req.user.id),
                };

        const issue = await Issue.findOne({ where });


        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        // Step 2: Prepare the prompt using saved issue data
        const prompt = `
You are a software issue-tracking assistant.

Analyze the following issue and provide:
1. A concise summary.
2. The likely cause, clearly marked as a possibility.
3. Suggested investigation steps.

Do not claim an unverified cause is confirmed.
Use only the supplied issue details.

Issue title: ${issue.title}
Issue description: ${issue.description}
Current status: ${issue.status}
Priority: ${issue.priority}
`;

        // Step 3: Send the prompt to the local Ollama model
        const ollamaUrl =
            process.env.OLLAMA_URL || "http://127.0.0.1:11434";

        const model = process.env.OLLAMA_MODEL || "qwen3:8b";

        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            150000
        );

        let result;

        try {
            const response = await fetch(`${ollamaUrl}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    prompt,
                    stream: false,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                console.error("Ollama HTTP status:", response.status);

                return res.status(502).json({
                    success: false,
                    message: "AI service could not process the issue",
                });
            }

            result = await response.json();
        } finally {
            clearTimeout(timeout);
        }

        if (typeof result.response !== "string") {
            return res.status(502).json({
                success: false,
                message: "AI service returned an unexpected response",
            });
        }

        // Step 4: Return the issue details and AI analysis
        return res.status(200).json({
            success: true,
            issue: {
                id: issue.id,
                title: issue.title,
                status: issue.status,
                priority: issue.priority,
            },
            aiAnalysis: result.response.trim(),
            model,
        });
    } catch (error) {
        console.error("Issue AI analysis failed:", error.message);

        return res.status(502).json({
            success: false,
            message:
                error.name === "AbortError"
                    ? "AI request timed out. Please try again."
                    : "Could not complete AI analysis",
        });
    }
});

export default router;