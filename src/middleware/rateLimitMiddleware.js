import rateLimit from "express-rate-limit";

const createRateLimiter = ({
    windowMs,
    limit,
    message,
}) => {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: {
            success: false,
            message,
        },
    });
};

export const loginRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: "Too many login attempts. Please try again after 15 minutes.",
});

export const registerRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: "Too many registration attempts. Please try again after one hour.",
});

export const aiSummarizeRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: "Too many AI summary requests. Please try again after 15 minutes.",
});

export const issueAiSummaryRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: "Too many issue AI summary requests. Please try again after 15 minutes.",
});