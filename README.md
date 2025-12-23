# 🌾 Farmer Weather Dashboard - Complete System

A modern **microservices-based agriculture monitoring system** that helps farmers track weather conditions, manage crops, receive automated alerts, and get AI-powered farming advice.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 5173)                   │
│              User Interface for Farmers                         │
└────────────┬────────────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────────┬──────────────────┐
    │                 │              │                  │
    ▼                 ▼              ▼                  ▼
┌─────────┐    ┌──────────┐   ┌──────────┐    ┌──────────────┐
│   Go    │    │  Spring  │   │   AI     │    │  External    │
│ Weather │    │   Boot   │   │  Spring  │    │  APIs        │
│ Service │    │ Backend  │   │ Service  │    │              │
│  :8081  │    │  :8080   │   │  :8082   │    │ OpenWeather  │
└─────────┘    └──────────┘   └──────────┘    │ Gemini AI    │
     │              │               │          └──────────────┘
     │         ┌────┴────┐     ┌────┴────┐
     │         │  MySQL  │     │ MongoDB │
     │         │Database │     │ Atlas   │
     └─────────┴─────────┴─────┴─────────┘
```

## 📦 Services Overview

### 1. **React Frontend** (Port 5173)
- User interface for farmers
- Dashboard, crop management, alerts, AI chat
- JWT-based authentication
- **Tech**: React 19, Vite, TailwindCSS, React Router

### 2. **Spring Boot Backend** (Port 8080)
- Main business logic service
- User authentication, crop management, alert generation
- Rule engine for weather-based alerts
- Email notifications
- **Tech**: Spring Boot 3.2, MySQL, JWT, Spring Security

### 3. **Go Weather Service** (Port 8081)
- Dedicated weather data service
- Fetches real-time weather from OpenWeather API
- Fast and efficient
- **Tech**: Go, Gorilla Mux, OpenWeather API

### 4. **AI Spring Service** (Port 8082)
- Agriculture AI chatbot
- Answers farming questions using Google Gemini AI
- Stores chat history in MongoDB
- **Tech**: Spring Boot 3.2, MongoDB Atlas, Gemini AI

## 🚀 Quick Start

### Prerequisites
```bash
# Java 17+
java -version

# Maven 3.6+
mvn -version

# Go 1.21+
go version

# Node.js 18+
node -version

# MySQL 8.0+
mysql -version
```

### 1. Setup MySQL Database
```bash
mysql -u root -p
CREATE DATABASE farmer_details;
exit
```

### 2. Configure API Keys

#### Spring Boot Backend
Edit `springboot-backend/src/main/resources/application.properties`:
```properties
# MySQL
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Gmail (for email alerts)
spring.mail.username=YOUR_GMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD

# OpenWeather API
weather.api.key=YOUR_OPENWEATHER_API_KEY
```

#### AI Spring Service
Edit `ai-spring/src/main/resources/application.properties`:
```properties
# MongoDB Atlas
spring.data.mongodb.uri=YOUR_MONGODB_CONNECTION_STRING

# Google Gemini AI
gemini.api.key=YOUR_GEMINI_API_KEY
```

### 3. Start All Services

#### Terminal 1: Go Weather Service
```bash
cd backend
go run main.go
# Running on http://localhost:8081
```

#### Terminal 2: Spring Boot Backend
```bash
cd springboot-backend
mvn spring-boot:run
# Running on http://localhost:8080
```

#### Terminal 3: AI Spring Service
```bash
cd ai-spring
mvn spring-boot:run
# Running on http://localhost:8082
```

#### Terminal 4: React Frontend
```bash
cd farmer-weather-dashboard
npm install
npm run dev
# Running on http://localhost:5173
```

### 4. Access the Application
Open your browser and navigate to: **http://localhost:5173**

## 📚 Documentation

- **[Complete System Architecture](./SYSTEM_ARCHITECTURE.md)** - Detailed architecture documentation
- **[Spring Boot Backend README](./springboot-backend/README.md)** - Backend service documentation
- **[AI Spring Service README](./ai-spring/README.md)** - AI service documentation
- **[Frontend README](./farmer-weather-dashboard/README.md)** - Frontend documentation
- **[Go Weather Service README](./backend/README.md)** - Weather service documentation

## 🔑 Getting API Keys

### OpenWeather API (Free)
1. Visit: https://openweathermap.org/api
2. Sign up for free account
3. Generate API key
4. Add to `springboot-backend/src/main/resources/application.properties`

### Google Gemini AI (Free)
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Add to `ai-spring/src/main/resources/application.properties`

### MongoDB Atlas (Free)
1. Visit: https://cloud.mongodb.com/
2. Create free M0 cluster
3. Create database user
4. Whitelist IP address
5. Get connection string
6. Add to `ai-spring/src/main/resources/application.properties`

### Gmail App Password (Free)
1. Enable 2-factor authentication on Gmail
2. Visit: https://myaccount.google.com/apppasswords
3. Generate app password
4. Add to `springboot-backend/src/main/resources/application.properties`

## 🌟 Features

### For Farmers
- ✅ Real-time weather monitoring
- ✅ 7-day weather history
- ✅ Crop management system
- ✅ Automated weather alerts
- ✅ Email notifications
- ✅ AI-powered farming assistant
- ✅ User profile management

### Technical Features
- ✅ Microservices architecture
- ✅ JWT authentication
- ✅ RESTful APIs
- ✅ Real-time weather data
- ✅ Rule-based alert engine
- ✅ AI chatbot integration
- ✅ Email notifications
- ✅ Responsive UI

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt password encryption
- **CORS Protection**: Configured CORS policies
- **API Key Management**: Secure API key storage
- **Input Validation**: Request validation on all endpoints

## 🧪 Testing

### Test Individual Services

```bash
# Test Go Weather Service
curl "http://localhost:8081/weather/current?location=Bangalore"

# Test Spring Boot Backend
curl "http://localhost:8080/actuator/health"

# Test AI Spring Service
curl "http://localhost:8082/ai/health"
```

### Test Complete Flow
1. Open http://localhost:5173
2. Create account
3. Login
4. View weather dashboard
5. Add a crop
6. Check alerts
7. Chat with AI assistant

## 📊 Database Schema

### MySQL (Spring Boot Backend)
- **farmers**: User accounts
- **crops**: Crop records
- **alerts**: Weather alerts
- **notifications**: Email logs

### MongoDB (AI Spring)
- **ai_chat_records**: Chat history

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Database Connection Failed
- Check MySQL is running
- Verify credentials in application.properties
- Ensure database exists

### API Key Errors
- Verify API keys are correct
- Check API key quotas/limits
- Ensure no extra spaces in keys

## 📈 Performance

- **Go Weather Service**: Handles 1000+ requests/second
- **Spring Boot Backend**: Optimized with connection pooling
- **AI Service**: Async processing for AI calls
- **Frontend**: Lazy loading and code splitting

## 🔄 CI/CD

Ready for deployment with:
- Docker containerization
- Kubernetes orchestration
- GitHub Actions workflows
- Environment-based configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Backend Development**: Spring Boot + Go microservices
- **Frontend Development**: React + TailwindCSS
- **AI Integration**: Google Gemini AI
- **Database**: MySQL + MongoDB Atlas

## 📞 Support

For issues or questions:
1. Check the [System Architecture](./SYSTEM_ARCHITECTURE.md) documentation
2. Review service-specific README files
3. Check application logs
4. Verify all services are running

## 🎯 Future Enhancements

- [ ] Real-time notifications with WebSocket
- [ ] Mobile app (React Native)
- [ ] ML-based crop yield prediction
- [ ] IoT sensor integration
- [ ] Multi-language support
- [ ] Offline PWA mode
- [ ] Payment integration
- [ ] Farmer community features

---

**Built with ❤️ for farmers worldwide**
