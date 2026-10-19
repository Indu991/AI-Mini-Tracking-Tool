import { jest } from "@jest/globals";

describe("Environment configuration validation", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };

        process.env.DB_HOST = "localhost";
        process.env.DB_PORT = "5432";
        process.env.DB_NAME = "ai_mini_tracking";
        process.env.DB_USER = "test_user";
        process.env.DB_PASSWORD = "test_password";
        process.env.JWT_SECRET = "a".repeat(32);
        process.env.JWT_EXPIRES_IN = "1h";
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test("accepts valid environment configuration", async () => {
        const { validateEnv } = await import("../src/config/validateEnv.js");

        expect(validateEnv()).toBe(true);
    });

    test("rejects a missing database password", async () => {
        delete process.env.DB_PASSWORD;

        const { validateEnv } = await import("../src/config/validateEnv.js");

        expect(() => validateEnv()).toThrow(
            "Missing required environment variables: DB_PASSWORD"
        );
    });

    test("rejects an invalid database port", async () => {
        process.env.DB_PORT = "70000";

        const { validateEnv } = await import("../src/config/validateEnv.js");

        expect(() => validateEnv()).toThrow(
            "DB_PORT must be a valid port number"
        );
    });

    test("rejects a weak JWT secret", async () => {
        process.env.JWT_SECRET = "short";

        const { validateEnv } = await import("../src/config/validateEnv.js");

        expect(() => validateEnv()).toThrow(
            "JWT_SECRET must be a secure secret with at least 32 characters"
        );
    });

    test("rejects an empty JWT expiry setting", async () => {
        process.env.JWT_EXPIRES_IN = " ";

        const { validateEnv } = await import("../src/config/validateEnv.js");

        expect(() => validateEnv()).toThrow(
            "JWT_EXPIRES_IN must not be empty"
        );
    });
});