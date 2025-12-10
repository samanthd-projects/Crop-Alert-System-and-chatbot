# AI Service

Minimal Express service that receives chatbot requests, fetches the current user from the Spring Boot backend, stores a canned reply in MongoDB, and returns the reply to the UI.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `env.example` to `.env` (or set environment variables another way) and adjust values if needed.
3. Run the service:
   ```
   npm run start
   ```

## Environment variables

- `PORT`: Port to run the service on (default `4000`).
- `MONGODB_URI`: Connection string for MongoDB (SRV provided).
- `MONGODB_DB_NAME`: Database name (default `fitness-ai-response`).
- `SPRING_BASE_URL`: Base URL of the Spring Boot backend (default `http://localhost:8080`).

## API

`POST /ai/respond`

Request body:
```json
{
  "language": "en",
  "message": "hello"
}
```

Headers:
- `Authorization: Bearer <jwt>` (same token used for Spring Boot).

Response:
```json
{ "reply": "hi" }
```

The service will store `{ userId, userName, language, response: "hi", requestMessage, createdAt }` in the `ai-response` collection of the `fitness-ai-response` database.

