# Spring Boot Backend - Farmer Weather Dashboard

Main business logic service for the Farmer Weather Dashboard system.

## Overview

This Spring Boot application handles:
- User authentication & authorization (JWT)
- Crop management
- Weather-based alert generation
- Email notifications
- Database operations (MySQL)
- Rule engine for automated alerts

## Technology Stack

- **Spring Boot 3.2.0**
- **Spring Security** (JWT authentication)
- **Spring Data JPA** (Database access)
- **MySQL 8.0+** (Database)
- **Spring Mail** (Email notifications)
- **WebFlux** (HTTP client for microservices)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Gmail account (for email notifications)
- OpenWeather API key

## Setup Instructions

### 1. Create MySQL Database

```bash
mysql -u root -p
CREATE DATABASE farmer_details;
exit
```

### 2. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# MySQL Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/farmer_details
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Gmail SMTP Configuration
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD

# OpenWeather API Key
weather.api.key=YOUR_OPENWEATHER_API_KEY
```

### 3. Get Gmail App Password

1. Enable 2-factor authentication on your Gmail account
2. Visit: https://myaccount.google.com/apppasswords
3. Generate an app password
4. Use this password in `spring.mail.password`

### 4. Get OpenWeather API Key

1. Visit: https://openweathermap.org/api
2. Sign up for free account
3. Generate API key
4. Add to `weather.api.key`

## Running the Application

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

# Application will start on http://localhost:8080
```

## API Endpoints

### Authentication

#### POST /farmer/signup
Create new farmer account
```json
{
  "name": "John Farmer",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "location": "Bangalore"
}
```

#### POST /farmer/login
Login and get JWT token
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "farmer": { ... }
}
```

### Profile (Requires JWT)

#### GET /farmer/profile
Get current user profile
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8080/farmer/profile
```

#### GET /farmer/profile/weather
Get weather for user's location + run alert rules
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8080/farmer/profile/weather
```


### Crops (Requires JWT)

#### GET /crops
Get all crops for current user
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8080/crops
```

#### POST /crops
Add new crop
```json
{
  "cropName": "Tomato",
  "cropType": "Vegetable",
  "plantingDate": "2025-01-01",
  "expectedHarvestDate": "2025-04-01",
  "areaInAcres": 2.5
}
```

#### PUT /crops/{cropId}
Update crop

#### DELETE /crops/{cropId}
Delete crop

### Alerts (Requires JWT)

#### GET /alerts/farmer/{farmerId}
Get all alerts for farmer

#### GET /alerts/farmer/{farmerId}/recent?days=7
Get recent alerts (last 7 days)

## Database Schema

### farmers
```sql
CREATE TABLE farmers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### crops
```sql
CREATE TABLE crops (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farmer_id BIGINT NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    crop_type VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    area_in_acres DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Active',
    FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);
```

### alerts
```sql
CREATE TABLE alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farmer_id BIGINT NOT NULL,
    crop_id BIGINT,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    weather_condition VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id)
);
```

## Rule Engine

The system automatically generates alerts based on weather conditions:

### Alert Rules
- **High Temperature**: > 35°C
- **Low Temperature**: < 10°C
- **High Humidity**: > 80%
- **Heavy Rainfall**: > 50mm
- **Strong Wind**: > 40 km/h

### Alert Severity Levels
- **HIGH**: Critical conditions requiring immediate action
- **MEDIUM**: Warning conditions to monitor
- **LOW**: Informational alerts

### Email Notifications
When alerts are generated:
1. Alert saved to database
2. Email sent to farmer's registered email
3. Email contains alert details and recommendations

## Microservices Communication

### Calling Go Weather Service
```java
WebClient client = WebClient.create("http://localhost:8081");
WeatherResponse weather = client.get()
    .uri("/weather/current?location=" + location)
    .retrieve()
    .bodyToMono(WeatherResponse.class)
    .block();
```

### JWT Token Validation
```java
// Extract token from Authorization header
String token = authHeader.replace("Bearer ", "");

// Validate and extract user ID
Long userId = jwtUtil.extractUserId(token);

// Use user ID for database queries
```

## Security

### Password Hashing
```java
// BCrypt with strength 10
String hashedPassword = passwordEncoder.encode(plainPassword);
```

### JWT Configuration
- **Secret Key**: Configured in application
- **Expiration**: 24 hours
- **Algorithm**: HS256

### CORS
```java
@CrossOrigin(origins = "http://localhost:5173")
```

## Logging

```properties
logging.level.com.farmer=DEBUG
logging.level.org.springframework.web=INFO
logging.level.org.springframework.security=DEBUG
```

View logs:
```bash
tail -f logs/application.log
```

## Testing

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Test Authentication
```bash
# Signup
curl -X POST http://localhost:8080/farmer/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"1234567890","password":"test123","location":"Bangalore"}'

# Login
curl -X POST http://localhost:8080/farmer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check credentials in application.properties
```

### Email Sending Failed
- Verify Gmail app password is correct
- Check 2-factor authentication is enabled
- Ensure less secure app access is not required

### Port 8080 Already in Use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

## Project Structure

```
springboot-backend/
├── src/main/java/com/farmer/cropmonitoring/
│   ├── config/              # Configuration classes
│   ├── controller/          # REST controllers
│   ├── dto/                 # Data transfer objects
│   ├── entity/              # JPA entities
│   ├── filter/              # JWT filter
│   ├── repository/          # JPA repositories
│   ├── scheduler/           # Scheduled tasks
│   ├── service/             # Business logic
│   ├── util/                # Utility classes
│   └── CropMonitoringApplication.java
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── README.md
```

## Dependencies

- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- spring-boot-starter-mail
- spring-boot-starter-validation
- spring-boot-starter-webflux
- mysql-connector-j
- jjwt (JWT library)
- lombok

## Environment Variables

For production, use environment variables:
```bash
export DB_PASSWORD=your_password
export MAIL_PASSWORD=your_app_password
export WEATHER_API_KEY=your_api_key
```

## Docker Support

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

Build and run:
```bash
mvn clean package
docker build -t farmer-backend .
docker run -p 8080:8080 farmer-backend
```

## Support

For issues:
1. Check application logs
2. Verify database connection
3. Test API endpoints with curl
4. Check JWT token validity

---

**Part of Farmer Weather Dashboard System**
