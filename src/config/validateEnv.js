const requiredVariables = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
];

export function validateEnv() {
    const missingVariables = requiredVariables.filter((name) => {
        return !process.env[name]?.trim();
    });

    if (missingVariables.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVariables.join(", ")}`
        );
    }

    if (!Number.isInteger(Number(process.env.DB_PORT)) ||
        Number(process.env.DB_PORT) < 1 ||
        Number(process.env.DB_PORT) > 65535) {
        throw new Error("DB_PORT must be a valid port number");
    }

    if (!process.env.JWT_EXPIRES_IN?.trim()) {
        throw new Error("JWT_EXPIRES_IN must not be empty");
    }

    const jwtSecret = process.env.JWT_SECRET.trim();

    if (
        jwtSecret === "replace_with_a_long_random_secret" ||
        jwtSecret.length < 32
    ) {
        throw new Error(
            "JWT_SECRET must be a secure secret with at least 32 characters"
        );
    }
    return true;
}