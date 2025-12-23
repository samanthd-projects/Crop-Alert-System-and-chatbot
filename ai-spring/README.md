# AI Spring Service

Standalone AI chat service for agriculture-related questions using Google Gemini API.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

## Setup Instructions

### 1. MongoDB Connection

This service uses **MongoDB Atlas** (cloud-hosted MongoDB). You don't need to run MongoDB locally.

#### Option A: Use Existing MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account
3. Navigate to your cluster: `Cluster0`
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string
6. Update `src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=your_connection_string_here
spring.data.mongodb.database=fitness-ai-response
```

#### Option B: Create New MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Create"** → **"Database"**
3. Choose **"M0 Free"** tier (free forever)
4. Select a cloud provider and region
5. Create cluster
6. Create database user:
   - Go to **"Database Access"** → **"Add New Database User"**
   - Choose **"Password"** authentication
   - Set username and password
   - Set user privileges to **"Read and write to any database"**
7. Whitelist your IP:
   - Go to **"Network Access"** → **"Add IP Address"**
   - Click **"Add Current IP Address"** (or use `0.0.0.0/0` for testing only)
8. Get connection string:
   - Go to **"Database"** → Click **"Connect"** → **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - URL-encode special characters (e.g., `@` becomes `%40`)
9. Update `src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
spring.data.mongodb.database=fitness-ai-response
```

**Example:**
```properties
spring.data.mongodb.uri=mongodb+srv://myuser:mypass%40db@cluster0.abc123.mongodb.net/?appName=Cluster0
spring.data.mongodb.database=fitness-ai-response
```

### 2. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select or create a Google Cloud project
5. Copy your API key (starts with `AIza...`)
6. Update `src/main/resources/application.properties`:

```properties
gemini.api.key=YOUR_GEMINI_API_KEY_HERE
```

**Example:**
```properties
gemini.api.key=AIzaSyD3MOvcgApq9HGVmfyryFzFv78yIRCnbWE
```

**⚠️ Security Note:** Never commit your real API key to git. The `application.properties` file is already in `.gitignore` to protect your secrets.

### 3. Configure Application Properties

1. Copy the example configuration:
   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   ```
   (Or create `application.properties` manually)

2. Update `src/main/resources/application.properties` with your credentials:

```properties
server.port=8082

# MongoDB Configuration
spring.data.mongodb.uri=your_mongodb_connection_string
spring.data.mongodb.database=fitness-ai-response

# Backend Service URL
spring.ai.backend.base-url=http://localhost:8080

# Gemini API Configuration
gemini.api.key=your_gemini_api_key_here
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

**⚠️ Important:** `application.properties` is in `.gitignore` - it won't be committed to git. This keeps your secrets safe!

## Running the Application

1. **Build the project:**
   ```bash
   mvn clean install
   ```

2. **Run the service:**
   ```bash
   mvn spring-boot:run
   ```

3. **Verify it's running:**
   - Service starts on: `http://localhost:8082`
   - Health check: `http://localhost:8082/ai/health`
   - Should return: `{"status":"ok","service":"ai-spring"}`

## API Endpoints

### POST `/ai/respond`
Chat endpoint for agriculture-related questions.

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "language": "en",
  "message": "What is red soil?"
}
```

**Response:**
```json
{
  "reply": "Red soil is a type of soil..."
}
```

### GET `/ai/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "ai-spring"
}
```

## Troubleshooting

### MongoDB Connection Issues

- **Error: "Connection refused"**
  - Check your IP is whitelisted in MongoDB Atlas Network Access
  - Verify connection string is correct
  - Ensure password is URL-encoded (e.g., `@` → `%40`)

- **Error: "Authentication failed"**
  - Verify database username and password
  - Check user has read/write permissions

### Gemini API Issues

- **Error: "API key not configured"**
  - Check `gemini.api.key` is set in `application.properties`
  - Verify API key is valid and active

- **Error: "401 Unauthorized"**
  - API key is invalid or expired
  - Get a new key from [Google AI Studio](https://aistudio.google.com/app/apikey)

- **Error: "429 Too Many Requests"**
  - Rate limit exceeded
  - Wait a few minutes and try again

### Service Won't Start

- Check Java version: `java -version` (should be 17+)
- Check port 8082 is not in use
- Verify all dependencies are installed: `mvn dependency:resolve`

## Project Structure

```
ai-spring/
├── src/
│   ├── main/
│   │   ├── java/com/example/aispring/
│   │   │   ├── controller/     # REST controllers
│   │   │   ├── service/        # Business logic
│   │   │   ├── repository/     # MongoDB repositories
│   │   │   ├── entity/         # MongoDB entities
│   │   │   └── dto/            # Data transfer objects
│   │   └── resources/
│   │       └── application.properties  # Configuration (gitignored)
│   └── test/
├── pom.xml                     # Maven dependencies
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Dependencies

- Spring Boot 3.2.5
- Spring Data MongoDB
- Spring WebFlux (for WebClient)
- Google Gemini API (via REST)

## Security Notes

- **Never commit `application.properties`** - it contains sensitive credentials
- Use environment variables or `.env` files for production
- Rotate API keys regularly
- Keep MongoDB connection strings secure

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify all configuration is correct
3. Test MongoDB and Gemini API connections separately

