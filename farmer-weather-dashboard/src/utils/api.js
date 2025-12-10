// API Configuration
import { auth } from './auth';

const API_BASE_URL = 'http://localhost:8080';
const WEATHER_API_BASE_URL = 'http://localhost:8081';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = auth.getToken();
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            if (response.status === 401) {
                auth.clear();
                window.location.href = '/login';
            }
            // Try to parse error response as JSON first
            let errorMessage = '';
            try {
                const errorJson = await response.json();
                errorMessage = errorJson.error || errorJson.message || JSON.stringify(errorJson);
            } catch {
                // If not JSON, read as text
                errorMessage = await response.text().catch(() => '');
            }
            throw new Error(errorMessage || `API Error: ${response.status} ${response.statusText}`);
        }
        
        // Handle 204 No Content (DELETE requests) - no body to parse
        if (response.status === 204 || response.status === 201) {
            // Check if response has content before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return null; // No content to return
            }
        }
        
        // Only parse JSON if there's content
        const text = await response.text();
        if (!text || text.trim() === '') {
            return null; // Empty response
        }
        return JSON.parse(text);
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

// Weather API calls (Go service)
async function weatherApiCall(endpoint, options = {}) {
    const url = `${WEATHER_API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`Weather API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Weather API Call Error:', error);
        throw error;
    }
}

// Farmer API
export const farmerAPI = {
    signup: async (data) => {
        const response = await apiCall('/farmer/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    },
    login: async (data) => {
        const response = await apiCall('/farmer/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // Store token and user data
        if (response.token) {
            auth.setToken(response.token);
            auth.setUser(response.farmer);
        }
        return response;
    },
    // Authenticated profile endpoints (use JWT token)
    getProfile: () => apiCall('/farmer/profile'),
    getProfileWeather: () => apiCall('/farmer/profile/weather'),
    logout: () => {
        auth.clear();
    },
};

// Crop API - Uses JWT token to get farmer ID automatically
export const cropAPI = {
    getCrops: () => apiCall(`/crops`),
    getCrop: (cropId) => apiCall(`/crops/${cropId}`),
    addCrop: (data) => apiCall(`/crops`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateCrop: (cropId, data) => apiCall(`/crops/${cropId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteCrop: (cropId) => apiCall(`/crops/${cropId}`, {
        method: 'DELETE',
    }),
};

// Weather API
export const weatherAPI = {
    getCurrentWeather: (location) => weatherApiCall(`/weather/current?location=${location}`),
    getWeatherHistory: (location) => weatherApiCall(`/weather/history?location=${location}`),
    // Use Spring Boot backend weather endpoint so rules & auth are applied
    getWeatherAndCheckRules: () => apiCall('/farmer/profile/weather'),
};

// Alert API
export const alertAPI = {
    getAlertsByFarmer: (farmerId) => apiCall(`/alerts/farmer/${farmerId}`),
    getRecentAlerts: (farmerId, days = 7) => apiCall(`/alerts/farmer/${farmerId}/recent?days=${days}`),
    getAlertsByCrop: (cropId) => apiCall(`/alerts/crop/${cropId}`),
};

// Notification API
export const notificationAPI = {
    getAllNotifications: () => apiCall('/notifications'),
    getNotificationsByEvent: (eventId) => apiCall(`/notifications/event/${eventId}`),
};

