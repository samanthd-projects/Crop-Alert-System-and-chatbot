# Farmer Weather Dashboard - Complete System Architecture

## System Overview

This is a **microservices-based agriculture monitoring system** that helps farmers track weather conditions, manage crops, and receive AI-powered farming advice. The system consists of 4 main services that communicate with each other.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    React Frontend (Port 5173)                   │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTP REST API Calls
             │
    ┌────────┴────────┬──────────────┬──────────────────┐
    │                 │              │                  │
    ▼                 ▼              ▼                  ▼
┌─────────┐    ┌──────────┐   ┌──────────┐    ┌──────────────┐
│   Go    │    │  Spring  │   │   AI     │    │  External    │
│ Weather │    │   Boot   │   │  Spring  │    │  APIs        │
│ Service │    │ Backend  │   │ Service  │    │              │
│:8081    │    │  :8080   │   │  :8082   │    │ OpenWeather  │
└─────────┘    └──────────┘   └──────────┘    │ Gemini AI    │
     │              │               │          └──────────────┘
     │              │               │
     │         ┌────┴────┐     ┌────┴────┐
     │         │  MySQL  │     │ MongoDB │
     │         │Database │     │ Atlas   │
     │         └─────────┘     └─────────┘
     │
     └──────► OpenWeather API
```

---

## 1. Frontend - React Dashboard (Port 5173)

**Technology**: React 19 + Vite + TailwindCSS + React Router

**Location**: `farmer-weather-dashboard/`

### Purpose
User interface for farmers to:
- Login/Signup
- View weather dashboard
- Manage crops
- View alerts
- Chat with AI assistant
- Update profile

### Key Features
- **Authentication**: JWT-based login system
- **Routing**: React Router for navigation
- **State Management**: React hooks (useState, useEffect)
- **API Communication**: Fetch API with auth headers

### How It Works

#### 1. User Login Flow
```
User enters email/password
    ↓
Frontend → POST /farmer/login → Spring Boot Backend
    ↓
Backend validates credentials
    ↓
Backend generates JWT token
    ↓
Frontend stores token in localStorage
    ↓
All subsequent requests include: Authorization: Bearer <token>
```

#### 2. Weather Data Flow
```
User views dashboard
    ↓
Frontend → GET /farmer/profile/weather → Spring Boot Backend
    ↓
Backend extracts user location from JWT token
    ↓
Backend → GET /weather/current?location=Bangalore → Go Weather Service
    ↓
Go Service → OpenWeather API
    ↓
Weather data flows back through chain
    ↓
Backend runs rule engine to check for alerts
    ↓
Frontend displays weather + alerts
```

#### 3. AI Chat Flow
```
User asks farming question
    ↓
Frontend → POST /ai/respond → AI Spring Service
    ↓
AI Service validates JWT token with Spring Boot Backend
    ↓
AI Service → Gemini API (Google AI)
    ↓
Gemini generates agriculture-specific response
    ↓
AI Service saves chat to MongoDB
    ↓
Response sent back to frontend
```

### API Endpoints Used
```javascript
// Spring Boot Backend (Port 8080)
POST   /farmer/signup          - Create account
POST   /farmer/login           - Login and get JWT
GET    /farmer/profile         - Get user profile
GET    /farmer/profile/weather - Get weather + run rules
GET    /crops                  - List user's crops
POST   /crops                  - Add new crop
PUT    /crops/:id              - Update crop
DELETE /crops/:id              - Delete crop
GET    /alerts/farmer/:id      - Get alerts

// Go Weather Service (Port 8081)
GET    /weather/current        - Current weather
GET    /weather/history        - 7-day history

// AI Spring Service (Port 8082)
POST   /ai/respond             - Chat with AI
GET    /ai/health              - Health check
```

### File Structure
```
farmer-weather-dashboard/
├── src/
│   ├── App.jsx              # Main app + routing
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── CropList.jsx     # Crop management
│   │   └── Profile.jsx      # User profile
│   └── utils/
│       ├── api.js           # API client functions
│       └── auth.js          # JWT token management
├── package.json
└── vite.config.js
```

---

## 2. Go Weather Service (Port 8081)

**Technology**: Go + Gorilla Mux + CORS

**Location**: `backend/`

### Purpose
Dedicated microservice for fetching real-time weather data from OpenWeather API.

### Why Separate Service?
- **Performance**: Go is fast and efficient for API calls
- **Scalability**: Can handle many concurrent weather requests
- **Separation of Concerns**: Weather logic isolated from business logic
- **Rate Limiting**: Centralized API key management

### How It Works

#### Weather Data Fetching
```go
1. Receive request: GET /weather/current?location=Bangalore

2. Call OpenWeather Geocoding API
   → Convert city name to coordinates (lat, lon)

3. Call OpenWeather Current Weather API
   → Get temperature, humidity, rainfall, wind speed

4. Transform data to standard format
   → Map weather conditions (Clear → sunny, Rain → rainy)

5. Return JSON response
```

#### API Integration
```
OpenWeather API Key: e58364c6f5bdd064916ca76878172898
Base URL: https://api.openweathermap.org/data/2.5

Endpoints Used:
- /weather?q={city}&appid={key}        # Current weather
- /forecast?lat={lat}&lon={lon}        # 5-day forecast
- /geo/1.0/direct?q={city}             # Geocoding
```

### Endpoints

#### GET /weather/current
```bash
curl "http://localhost:8081/weather/current?location=Bangalore"
```
Response:
```json
{
  "location": "Bangalore",
  "current": {
    "temperature": 28.5,
    "humidity": 65,
    "rainfall": 0,
    "windSpeed": 12.5,
    "condition": "cloudy",
    "icon": "04d",
    "timestamp": "2025-12-23T10:30:00Z"
  }
}
```

#### GET /weather/history
```bash
curl "http://localhost:8081/weather/history?location=Bangalore"
```
Returns 7 days of historical weather data.

### Running the Service
```bash
cd backend
go run main.go
# Or use the compiled executable
./weather-service.exe
```

---

## 3. Spring Boot Backend (Port 8080)

**Technology**: Spring Boot 3.2 + MySQL + JWT + Spring Security

**Location**: `springboot-backend/`

### Purpose
Main business logic service that handles:
- User authentication & authorization
- Crop management
- Alert generation
- Rule engine for weather-based alerts
- Email notifications
- Database operations

### Architecture

```
Controller Layer (REST API)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Database Access)
    ↓
MySQL Database
```

### Key Components

#### 1. Authentication System
```java
// JWT Token Generation
User logs in → Validate credentials → Generate JWT token
Token contains: userId, email, expiration time
Token signed with secret key

// JWT Token Validation
Every request → Extract token from Authorization header
→ Validate signature → Extract user ID → Process request
```

#### 2. Rule Engine
```java
// Weather-based alert generation
1. Fetch current weather for user's location
2. Get all crops for this user
3. For each crop, check rules:
   - High temperature alert (> 35°C)
   - Low temperature alert (< 10°C)
   - High humidity alert (> 80%)
   - Heavy rainfall alert (> 50mm)
   - Strong wind alert (> 40 km/h)
4. Generate alerts if conditions met
5. Send email notifications
6. Save alerts to database
```

#### 3. Database Schema
```sql
-- Farmers table
CREATE TABLE farmers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255),  -- BCrypt hashed
    location VARCHAR(255),
    created_at TIMESTAMP
);

-- Crops table
CREATE TABLE crops (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farmer_id BIGINT,
    crop_name VARCHAR(255),
    crop_type VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    area_in_acres DECIMAL(10,2),
    status VARCHAR(50),
    FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- Alerts table
CREATE TABLE alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farmer_id BIGINT,
    crop_id BIGINT,
    alert_type VARCHAR(100),
    severity VARCHAR(50),
    message TEXT,
    weather_condition VARCHAR(255),
    created_at TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id)
);
```

### Configuration
File: `springboot-backend/src/main/resources/application.properties`

```properties
# Server
server.port=8080

# MySQL Database
spring.datasource.url=jdbc:mysql://localhost:3306/farmer_details
spring.datasource.username=root
spring.datasource.password=sam@database

# Email (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=samanthsamanth2@gmail.com
spring.mail.password=Samanthd@123

# Weather Service
weather.api.base-url=http://localhost:8081
```

### Running the Service
```bash
cd springboot-backend
mvn clean install
mvn spring-boot:run
```

---

## 4. AI Spring Service (Port 8082)

**Technology**: Spring Boot 3.2 + MongoDB Atlas + Google Gemini AI

**Location**: `ai-spring/`

### Purpose
Dedicated AI chatbot service for agriculture-related questions using Google's Gemini AI.

### Why Separate AI Service?
- **Scalability**: AI processing isolated from main backend
- **Flexibility**: Easy to switch AI providers
- **Performance**: Non-blocking AI calls
- **Data Isolation**: Chat history in separate MongoDB database

### How It Works

#### Chat Flow
```
1. User sends message: "What is red soil?"
   ↓
2. Frontend → POST /ai/respond (with JWT token)
   ↓
3. AI Service validates token with Spring Boot Backend
   ↓
4. Check if question is agriculture-related
   ↓
5. If yes → Call Gemini AI API
   ↓
6. Gemini generates response
   ↓
7. Save chat record to MongoDB
   ↓
8. Return response to user
```

#### Agriculture Filter
```java
// Only agriculture questions allowed
Keywords: farm, crop, soil, irrigation, pest, fertilizer,
          livestock, harvest, weather, yield, plant, seed

Non-agriculture questions get:
"Please ask an agriculture-related question."
```

#### Gemini AI Integration
```java
API: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
Method: POST
Headers:
  - Content-Type: application/json
  - x-goog-api-key: AIzaSyCdsf4YITumx4LZrCnEwUS6FcqscFJsFPo

Payload:
{
  "contents": [{
    "parts": [{
      "text": "You are an agriculture assistant. User: What is red soil?"
    }]
  }]
}
```

### MongoDB Storage
```javascript
// Chat records stored in MongoDB Atlas
{
  "_id": ObjectId("..."),
  "userId": 123,
  "userName": "John Farmer",
  "language": "en",
  "requestMessage": "What is red soil?",
  "response": "Red soil is a type of soil...",
  "timestamp": ISODate("2025-12-23T10:30:00Z")
}
```

### Configuration
File: `ai-spring/src/main/resources/application.properties`

```properties
# Server
server.port=8082

# MongoDB Atlas
spring.data.mongodb.uri=mongodb+srv://username:password@cluster0.mongodb.net/
spring.data.mongodb.database=fitness-ai-response

# Spring Boot Backend
spring.ai.backend.base-url=http://localhost:8080

# Gemini AI
gemini.api.key=YOUR_GEMINI_API_KEY
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

### Running the Service
```bash
cd ai-spring
mvn clean install
mvn spring-boot:run
```

---

## Complete User Journey

### 1. User Registration & Login
```
1. User opens http://localhost:5173
2. Clicks "Create account"
3. Fills form: name, email, phone, password, location
4. Frontend → POST /farmer/signup → Spring Boot Backend
5. Backend hashes password with BCrypt
6. Backend saves user to MySQL
7. Backend generates JWT token
8. Frontend stores token in localStorage
9. User redirected to dashboard
```

### 2. Viewing Weather Dashboard
```
1. User lands on dashboard
2. Frontend → GET /farmer/profile/weather → Spring Boot Backend
3. Backend extracts user location from JWT (e.g., "Bangalore")
4. Backend → GET /weather/current?location=Bangalore → Go Service
5. Go Service → OpenWeather API
6. Weather data flows back
7. Backend runs rule engine:
   - Checks temperature, humidity, rainfall, wind
   - Generates alerts if thresholds exceeded
   - Saves alerts to MySQL
   - Sends email notifications
8. Frontend displays:
   - Current temperature, humidity, rainfall
   - Weather condition with icon
   - Active alerts
   - 7-day weather history chart
```

### 3. Managing Crops
```
1. User clicks "Crops" → "Add Crop"
2. Fills form: crop name, type, planting date, area
3. Frontend → POST /crops → Spring Boot Backend
4. Backend extracts farmer ID from JWT
5. Backend saves crop to MySQL
6. Crop appears in user's crop list
7. Rule engine monitors weather for this crop
8. Alerts generated when weather threatens crop
```

### 4. Chatting with AI
```
1. User types: "How to prevent pest attacks on tomatoes?"
2. Frontend → POST /ai/respond → AI Spring Service
3. AI Service validates JWT with Spring Boot Backend
4. AI Service checks if question is agriculture-related ✓
5. AI Service → Gemini AI API
6. Gemini generates response about pest prevention
7. AI Service saves chat to MongoDB
8. Response displayed in chat interface
```

---

## Microservices Communication

### Service-to-Service Calls

#### 1. Frontend → Spring Boot Backend
```javascript
// All authenticated requests
fetch('http://localhost:8080/farmer/profile', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})
```

#### 2. Spring Boot Backend → Go Weather Service
```java
// WebClient call
WebClient client = WebClient.create("http://localhost:8081");
WeatherResponse weather = client.get()
    .uri("/weather/current?location=" + location)
    .retrieve()
    .bodyToMono(WeatherResponse.class)
    .block();
```

#### 3. AI Spring → Spring Boot Backend
```java
// Validate JWT and get user profile
WebClient client = WebClient.create("http://localhost:8080");
FarmerProfile profile = client.get()
    .uri("/farmer/profile")
    .header("Authorization", authHeader)
    .retrieve()
    .bodyToMono(FarmerProfile.class)
    .block();
```

#### 4. AI Spring → Gemini AI
```java
// External API call
WebClient client = WebClient.create();
String response = client.post()
    .uri(geminiApiUrl)
    .header("x-goog-api-key", apiKey)
    .bodyValue(payload)
    .retrieve()
    .bodyToMono(String.class)
    .block();
```

#### 5. Go Weather Service → OpenWeather API
```go
// HTTP GET request
url := fmt.Sprintf("%s/weather?q=%s&appid=%s&units=metric",
    OpenWeatherBaseURL, city, OpenWeatherAPIKey)
resp, err := http.Get(url)
```

---

## Security

### 1. JWT Authentication
```
Token Format: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Token Payload:
{
  "userId": 123,
  "email": "farmer@example.com",
  "exp": 1735123456  // Expiration timestamp
}

Validation:
- Verify signature with secret key
- Check expiration time
- Extract user ID for database queries
```

### 2. Password Security
```java
// BCrypt hashing (Spring Security)
String hashedPassword = passwordEncoder.encode(plainPassword);
// Stored in database: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

// Verification
boolean matches = passwordEncoder.matches(plainPassword, hashedPassword);
```

### 3. CORS Configuration
```java
// Allow frontend to access backend
@CrossOrigin(origins = "http://localhost:5173")
```

---

## External APIs

### 1. OpenWeather API
```
Provider: OpenWeatherMap
API Key: e58364c6f5bdd064916ca76878172898
Base URL: https://api.openweathermap.org/data/2.5

Endpoints:
- Current Weather: /weather?q={city}&appid={key}&units=metric
- 5-Day Forecast: /forecast?lat={lat}&lon={lon}&appid={key}&units=metric
- Geocoding: /geo/1.0/direct?q={city}&appid={key}

Rate Limit: 1000 calls/day (free tier)
```

### 2. Google Gemini AI
```
Provider: Google AI
API Key: AIzaSyCdsf4YITumx4LZrCnEwUS6FcqscFJsFPo
Model: gemini-2.5-flash
Base URL: https://generativelanguage.googleapis.com/v1beta

Features:
- Natural language understanding
- Agriculture-specific responses
- Fast response time
- Free tier available
```

---

## Database Architecture

### MySQL (Spring Boot Backend)
```
Database: farmer_details
Tables:
- farmers (user accounts)
- crops (crop records)
- alerts (weather alerts)
- notifications (email logs)

Relationships:
farmers 1→N crops
farmers 1→N alerts
crops 1→N alerts
```

### MongoDB Atlas (AI Spring)
```
Database: fitness-ai-response
Collection: ai_chat_records

Document Structure:
{
  userId: Long,
  userName: String,
  language: String,
  requestMessage: String,
  response: String,
  timestamp: Date
}
```

---

## Running the Complete System

### Prerequisites
```bash
# 1. Install Java 17+
java -version

# 2. Install Maven
mvn -version

# 3. Install Go 1.21+
go version

# 4. Install Node.js 18+
node -version

# 5. Install MySQL
mysql -version

# 6. Create MySQL database
mysql -u root -p
CREATE DATABASE farmer_details;
```

### Start All Services

#### Terminal 1: Go Weather Service
```bash
cd backend
go run main.go
# Service running on http://localhost:8081
```

#### Terminal 2: Spring Boot Backend
```bash
cd springboot-backend
mvn spring-boot:run
# Service running on http://localhost:8080
```

#### Terminal 3: AI Spring Service
```bash
cd ai-spring
mvn spring-boot:run
# Service running on http://localhost:8082
```

#### Terminal 4: React Frontend
```bash
cd farmer-weather-dashboard
npm install
npm run dev
# Frontend running on http://localhost:5173
```

### Verify All Services
```bash
# Check Go Weather Service
curl http://localhost:8081/weather/current?location=Bangalore

# Check Spring Boot Backend
curl http://localhost:8080/actuator/health

# Check AI Spring Service
curl http://localhost:8082/ai/health

# Open Frontend
# Visit http://localhost:5173 in browser
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

#### 2. Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check credentials in application.properties
```

#### 3. JWT Token Expired
```javascript
// Frontend automatically redirects to login
// User needs to login again
```

#### 4. Weather API Rate Limit
```
Error: 429 Too Many Requests
Solution: Wait for rate limit reset (24 hours)
Or: Upgrade to paid OpenWeather plan
```

#### 5. Gemini AI API Error
```
Error: 401 Unauthorized
Solution: Check API key in application.properties
Get new key from: https://aistudio.google.com/app/apikey
```

---

## Performance Optimization

### 1. Caching
```java
// Cache weather data for 5 minutes
@Cacheable(value = "weather", key = "#location")
public WeatherResponse getWeather(String location) {
    // Expensive API call
}
```

### 2. Async Processing
```java
// Send emails asynchronously
@Async
public void sendAlertEmail(String to, String message) {
    // Email sending logic
}
```

### 3. Database Indexing
```sql
-- Index frequently queried columns
CREATE INDEX idx_farmer_email ON farmers(email);
CREATE INDEX idx_crop_farmer ON crops(farmer_id);
CREATE INDEX idx_alert_farmer ON alerts(farmer_id);
```

---

## Monitoring & Logging

### Application Logs
```bash
# Spring Boot Backend
tail -f springboot-backend/logs/application.log

# AI Spring Service
tail -f ai-spring/logs/application.log

# Go Weather Service
# Logs to console
```

### Health Checks
```bash
# Spring Boot Backend
curl http://localhost:8080/actuator/health

# AI Spring Service
curl http://localhost:8082/ai/health

# Go Weather Service
curl http://localhost:8081/weather/current?location=Test
```

---

## Future Enhancements

1. **Real-time Notifications**: WebSocket for instant alerts
2. **Mobile App**: React Native mobile application
3. **Advanced Analytics**: ML-based crop yield prediction
4. **IoT Integration**: Connect soil sensors and weather stations
5. **Multi-language Support**: Support for regional languages
6. **Offline Mode**: PWA with offline capabilities
7. **Payment Integration**: Premium features subscription
8. **Social Features**: Farmer community and knowledge sharing

---

## Summary

This system demonstrates a modern microservices architecture with:
- **4 independent services** working together
- **3 databases** (MySQL, MongoDB, External APIs)
- **JWT-based authentication** for security
- **RESTful APIs** for communication
- **Real-time weather monitoring**
- **AI-powered assistance**
- **Automated alert generation**
- **Email notifications**

Each service has a specific responsibility and can be scaled independently, making the system robust, maintainable, and production-ready.
