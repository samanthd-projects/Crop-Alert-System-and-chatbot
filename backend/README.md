# Weather Service Backend

Golang backend for the Weather Service application using OpenWeatherMap API.

## Setup Instructions

### 1. Get OpenWeatherMap API Key (Free)

1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click "Sign Up" (it's free)
3. After signing up, go to your API keys section
4. Copy your API key
5. Replace `YOUR_OPENWEATHER_API_KEY` in `main.go` with your actual API key

### 2. Install Dependencies

```bash
cd backend
go mod download
```

### 3. Update API Key

Open `main.go` and replace:
```go
const (
	OpenWeatherAPIKey = "YOUR_OPENWEATHER_API_KEY" // Replace this
)
```

With your actual API key:
```go
const (
	OpenWeatherAPIKey = "your_actual_api_key_here"
)
```

### 4. Run the Server

```bash
go run main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

- `GET /weather/current?location={city}` - Get current weather
- `GET /weather/history?location={city}` - Get weather history (7 days)

## Testing

See `API_TESTING.md` in the root directory for curl commands and Postman collection.

## Notes

- Free tier of OpenWeatherMap allows 60 calls/minute
- The API key is required for the service to work
- If API key is not set, the service will use hardcoded city coordinates as fallback

