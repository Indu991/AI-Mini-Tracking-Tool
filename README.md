# AI Mini Tracking Tool

A backend-only issue tracking application built with Node.js, Express.js, PostgreSQL, and local AI using Ollama. The project demonstrates secure API development, role-based access control, issue ownership, and AI-powered issue analysis.

## Features

- **Authentication:** User registration and login using JWT.
- **Role-based access control:** Admin and Developer roles with different permissions.
- **Issue management:** Create, view, update, and delete issues through REST APIs.
- **Issue ownership:** Developers can access their own issues, while Admins can view all issues.
- **AI summaries:** Generate summaries for issue descriptions using a local Ollama model.
- **AI issue analysis:** Analyze saved issues and receive a summary, possible cause, and suggested investigation steps.
- **Input validation:** Validate request data and reject invalid input.
- **Error handling:** Handle AI service errors and request timeouts.
- **Automated testing:** API tests using Jest and Supertest.

## Technology Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JSON Web Tokens (JWT)
- bcryptjs
- Ollama
- Jest
- Supertest
- Postman

## Prerequisites

Install the following before running the application:

- Node.js and npm
- PostgreSQL
- Ollama
- Git

Pull the model used by the application:

```bash
ollama pull qwen3:8b
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Indu991/AI-Mini-Tracking-Tool.git
cd AI-Mini-Tracking-Tool
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file in the project root. Use `.env.example` as a reference.

Configure the following variables according to your local environment:

- `PORT`
- `OLLAMA_URL`
- `OLLAMA_MODEL`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Use your own PostgreSQL credentials and a strong, private JWT secret. Never commit `.env` to GitHub.

### 4. Prepare PostgreSQL

Create a PostgreSQL database named `ai_mini_tracking`, or use the database name configured in your `.env` file.

Ensure your database credentials match your local configuration.

### 5. Start Ollama

Make sure Ollama is installed and the configured model is available.

The default URL is:

```text
http://127.0.0.1:11434
```

### 6. Start the application

Development mode:

```bash
npm run dev
```

Or standard mode:

```bash
npm start
```

The default API base URL is:

```text
http://127.0.0.1:3000
```

The application authenticates with PostgreSQL and synchronizes its Sequelize models at startup.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| POST | `/api/auth/register` | Register a Developer account |
| POST | `/api/auth/login` | Log in and obtain a JWT |
| POST | `/api/ai/summarize` | Summarize a supplied issue description |
| POST | `/api/issues` | Create an issue |
| GET | `/api/issues` | List accessible issues |
| GET | `/api/issues/:id` | Retrieve an issue |
| PATCH | `/api/issues/:id` | Update an issue |
| DELETE | `/api/issues/:id` | Delete an issue (Admin only) |
| POST | `/api/issues/:id/ai-summary` | Analyze a saved issue using AI |

Protected endpoints require a valid JWT in the `Authorization` header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

Developers can access their own issues. Admins can access issues across users and delete issues.

## Testing

Start the backend in one terminal. Run the automated tests in another:

```bash
npm test
```

The test suite covers authentication requirements, issue permissions, ownership restrictions, and AI input validation.

## AI Integration

The application uses Ollama to run a language model locally. It can summarize an issue description or analyze a saved issue to provide:

- A concise issue summary
- A possible cause, clearly marked as unverified
- Suggested investigation steps

AI output is generated and may not always be correct. Suggested causes should be verified before acting on them.

## Project Goals

This project is a personal backend learning and portfolio project focused on combining traditional REST API development with local generative AI.

It uses fictional issue data and is independent of employer code and systems.

## Future Improvements

- Improve API documentation
- Expand automated test coverage
- Add structured logging
- Improve AI response formatting
- Add more comprehensive integration tests

## Author

Indu Reddy Gajjala