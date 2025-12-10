package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

const (
	// Get your free API key from https://openweathermap.org/api
	// Sign up is free and takes 2 minutes
	OpenWeatherAPIKey  = "e58364c6f5bdd064916ca76878172898"
	OpenWeatherBaseURL = "https://api.openweathermap.org/data/2.5"
)

type WeatherResponse struct {
	Location string      `json:"location"`
	Current  WeatherData `json:"current"`
}

type WeatherData struct {
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	Rainfall    float64 `json:"rainfall"`
	WindSpeed   float64 `json:"windSpeed"`
	Condition   string  `json:"condition"`
	Icon        string  `json:"icon"`
	Timestamp   string  `json:"timestamp"`
}

type HistoryResponse struct {
	Location string        `json:"location"`
	History  []WeatherData `json:"history"`
}

// OpenWeatherMap Current Weather Response
type OpenWeatherCurrentResponse struct {
	Main struct {
		Temp     float64 `json:"temp"`
		Humidity float64 `json:"humidity"`
		Pressure float64 `json:"pressure"`
	} `json:"main"`
	Weather []struct {
		Main        string `json:"main"`
		Description string `json:"description"`
		Icon        string `json:"icon"`
	} `json:"weather"`
	Wind struct {
		Speed float64 `json:"speed"`
	} `json:"wind"`
	Rain *struct {
		OneH float64 `json:"1h"`
	} `json:"rain,omitempty"`
	Dt int64 `json:"dt"`
}

// OpenWeatherMap Forecast Response
type OpenWeatherForecastResponse struct {
	List []struct {
		Dt   int64 `json:"dt"`
		Main struct {
			Temp     float64 `json:"temp"`
			Humidity float64 `json:"humidity"`
			Pressure float64 `json:"pressure"`
		} `json:"main"`
		Weather []struct {
			Main        string `json:"main"`
			Description string `json:"description"`
			Icon        string `json:"icon"`
		} `json:"weather"`
		Wind struct {
			Speed float64 `json:"speed"`
		} `json:"wind"`
		Rain *struct {
			ThreeH float64 `json:"3h"`
		} `json:"rain,omitempty"`
	} `json:"list"`
}

type GeocodeResponse struct {
	Results []struct {
		Geometry struct {
			Location struct {
				Lat float64 `json:"lat"`
				Lng float64 `json:"lng"`
			} `json:"location"`
		} `json:"geometry"`
	} `json:"results"`
}

func getCoordinates(city string) (float64, float64, error) {
	// Always use OpenWeatherMap Geocoding API to get coordinates from city name
	// This supports all cities worldwide, including Bangalore, Mumbai, Delhi, etc.
	cityTrimmed := strings.TrimSpace(city)
	if cityTrimmed == "" {
		return 0, 0, fmt.Errorf("city name cannot be empty")
	}

	// Use OpenWeatherMap Geocoding API
	url := fmt.Sprintf("http://api.openweathermap.org/geo/1.0/direct?q=%s&limit=1&appid=%s",
		strings.ReplaceAll(cityTrimmed, " ", "+"), OpenWeatherAPIKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to fetch coordinates: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return 0, 0, fmt.Errorf("geocoding API error (status %d): %s", resp.StatusCode, string(body))
	}

	var geocode []struct {
		Lat     float64 `json:"lat"`
		Lon     float64 `json:"lon"`
		Name    string  `json:"name"`
		Country string  `json:"country"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&geocode); err != nil {
		return 0, 0, fmt.Errorf("failed to decode geocoding response: %v", err)
	}

	if len(geocode) == 0 {
		return 0, 0, fmt.Errorf("city '%s' not found in geocoding API", cityTrimmed)
	}

	return geocode[0].Lat, geocode[0].Lon, nil
}

func fetchCurrentWeather(city string) (*OpenWeatherCurrentResponse, error) {
	url := fmt.Sprintf("%s/weather?q=%s&appid=%s&units=metric", OpenWeatherBaseURL, city, OpenWeatherAPIKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var data OpenWeatherCurrentResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return &data, nil
}

func fetchForecastData(lat, lon float64) (*OpenWeatherForecastResponse, error) {
	url := fmt.Sprintf("%s/forecast?lat=%.4f&lon=%.4f&appid=%s&units=metric", OpenWeatherBaseURL, lat, lon, OpenWeatherAPIKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var data OpenWeatherForecastResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return &data, nil
}

func mapCondition(weatherMain string) string {
	conditions := map[string]string{
		"Clear":        "sunny",
		"Clouds":       "cloudy",
		"Rain":         "rainy",
		"Drizzle":      "rainy",
		"Thunderstorm": "stormy",
		"Snow":         "snowy",
		"Mist":         "misty",
		"Fog":          "foggy",
	}

	if cond, ok := conditions[weatherMain]; ok {
		return cond
	}
	return "cloudy"
}

func getCurrentWeather(w http.ResponseWriter, r *http.Request) {
	location := r.URL.Query().Get("location")
	if location == "" {
		location = "Bangalore"
	}

	// Use OpenWeatherMap API directly with city name from profile location
	// This supports all cities worldwide: Bangalore, Mumbai, Delhi, Chennai, etc.
	data, err := fetchCurrentWeather(location)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching weather for '%s': %v", location, err), http.StatusInternalServerError)
		return
	}

	condition := "cloudy"
	icon := "01d"
	if len(data.Weather) > 0 {
		condition = mapCondition(data.Weather[0].Main)
		icon = data.Weather[0].Icon
	}

	rainfall := 0.0
	if data.Rain != nil && data.Rain.OneH > 0 {
		rainfall = data.Rain.OneH
	}

	weatherData := WeatherData{
		Temperature: data.Main.Temp,
		Humidity:    data.Main.Humidity,
		Rainfall:    rainfall,
		WindSpeed:   data.Wind.Speed * 3.6, // Convert m/s to km/h
		Condition:   condition,
		Icon:        icon,
		Timestamp:   time.Now().Format(time.RFC3339),
	}

	response := WeatherResponse{
		Location: location,
		Current:  weatherData,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getWeatherHistory(w http.ResponseWriter, r *http.Request) {
	location := r.URL.Query().Get("location")
	if location == "" {
		location = "Bangalore"
	}

	// Get coordinates from OpenWeatherMap Geocoding API based on profile location
	lat, lon, err := getCoordinates(location)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error getting coordinates for '%s': %v", location, err), http.StatusInternalServerError)
		return
	}

	data, err := fetchForecastData(lat, lon)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching forecast: %v", err), http.StatusInternalServerError)
		return
	}

	if len(data.List) == 0 {
		http.Error(w, "No forecast data available", http.StatusNotFound)
		return
	}

	history := make([]WeatherData, 0)
	now := time.Now()

	// Generate last 7 days of data using forecast
	for i := 6; i >= 0; i-- {
		date := now.AddDate(0, 0, -i)

		// Find closest forecast data point
		var closestIdx int = -1
		minDiff := int64(999999999)
		for idx := range data.List {
			forecastTime := time.Unix(data.List[idx].Dt, 0)
			diff := abs(date.Unix() - forecastTime.Unix())
			if diff < minDiff {
				minDiff = diff
				closestIdx = idx
			}
		}

		if closestIdx >= 0 {
			closest := data.List[closestIdx]
			condition := "cloudy"
			icon := "01d"
			if len(closest.Weather) > 0 {
				condition = mapCondition(closest.Weather[0].Main)
				icon = closest.Weather[0].Icon
			}

			rainfall := 0.0
			if closest.Rain != nil && closest.Rain.ThreeH > 0 {
				rainfall = closest.Rain.ThreeH
			}

			history = append(history, WeatherData{
				Temperature: closest.Main.Temp,
				Humidity:    closest.Main.Humidity,
				Rainfall:    rainfall,
				WindSpeed:   closest.Wind.Speed * 3.6,
				Condition:   condition,
				Icon:        icon,
				Timestamp:   date.Format("2006-01-02"),
			})
		} else {
			// If no forecast data, use first available data
			if len(data.List) > 0 {
				avg := data.List[0]
				condition := "cloudy"
				icon := "01d"
				if len(avg.Weather) > 0 {
					condition = mapCondition(avg.Weather[0].Main)
					icon = avg.Weather[0].Icon
				}

				rainfall := 0.0
				if avg.Rain != nil && avg.Rain.ThreeH > 0 {
					rainfall = avg.Rain.ThreeH
				}

				history = append(history, WeatherData{
					Temperature: avg.Main.Temp,
					Humidity:    avg.Main.Humidity,
					Rainfall:    rainfall,
					WindSpeed:   avg.Wind.Speed * 3.6,
					Condition:   condition,
					Icon:        icon,
					Timestamp:   date.Format("2006-01-02"),
				})
			}
		}
	}

	response := HistoryResponse{
		Location: location,
		History:  history,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func abs(x int64) int64 {
	if x < 0 {
		return -x
	}
	return x
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/weather/current", getCurrentWeather).Methods("GET")
	r.HandleFunc("/weather/history", getWeatherHistory).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	fmt.Println("Weather Service Backend running on http://localhost:8081")
	log.Fatal(http.ListenAndServe(":8081", handler))
}
