import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, AlertTriangle, ArrowUpRight, Calendar, RefreshCw } from 'lucide-react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { weatherAPI, alertAPI } from '../utils/api';
import { clsx } from 'clsx';
import { auth } from '../utils/auth';

export default function Dashboard() {
    const [weather, setWeather] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Get farmer ID and location from auth
    const user = auth.getUser();
    const farmerId = user?.id;

    const fetchData = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
                setRefreshing(true);
            }
            // Fetch weather based on authenticated user's profile/location
            const weatherData = await weatherAPI.getWeatherAndCheckRules();
            setWeather(weatherData);

            // Fetch recent alerts
            const alertsData = await alertAPI.getRecentAlerts(farmerId, 7);
            setAlerts(alertsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            if (showLoading) {
                setRefreshing(false);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial load when dashboard mounts (e.g., after login/signup)
        fetchData(true);

        // Auto-refresh every 1 hour (3600000 milliseconds)
        const interval = setInterval(() => {
            fetchData(false); // Silent update - no loading state
        }, 3600000); // 1 hour
        
        return () => clearInterval(interval);
    }, [farmerId]);

    const current = weather ? {
        temp: weather.temperature?.toFixed(1) || 0,
        condition: weather.condition || 'Unknown',
        humidity: 0, // Not in response
        windSpeed: weather.windSpeed?.toFixed(1) || 0,
        rainfall: weather.rainfall?.toFixed(1) || 0,
    } : { temp: 0, condition: 'Loading...', humidity: 0, windSpeed: 0, rainfall: 0 };

    const latestAlert = alerts.length > 0 ? alerts[0] : null;

    const getWeatherIcon = (condition, className) => {
        switch (condition.toLowerCase()) {
            case 'sunny': return <Cloud className={clsx("text-yellow-500", className)} />;
            case 'cloudy': return <Cloud className={clsx("text-gray-500", className)} />;
            case 'rain': return <Droplets className={clsx("text-blue-500", className)} />;
            default: return <Cloud className={clsx("text-blue-400", className)} />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader title="Dashboard" description="Loading weather data..." />
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-500">Loading data from backend...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <PageHeader title="Dashboard" description="Error loading data" />
                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                    <p className="text-red-700">Error: {error}</p>
                        <p className="text-red-600 text-sm mt-2">Make sure the backend services are running and you are logged in.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-gray-500 flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <Button
                    variant="secondary"
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                >
                    <RefreshCw size={16} className={clsx(refreshing && "animate-spin")} />
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
            </div>

            {/* Latest Alert */}
            {latestAlert && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start shadow-sm animate-slide-up">
                    <div className="p-3 bg-red-100 rounded-xl mr-4 flex-shrink-0">
                        <AlertTriangle className="text-red-600 w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-red-900 font-bold text-lg">Active Alert: {latestAlert.alertType}</h3>
                        <p className="text-red-700 mt-1">
                            {latestAlert.cropName}: {latestAlert.alertType} - 
                            Temp: {latestAlert.temperature?.toFixed(1)}°C, 
                            Rain: {latestAlert.rainfall?.toFixed(1)}mm, 
                            Wind: {latestAlert.wind?.toFixed(1)}km/h
                        </p>
                        <p className="text-red-600/80 text-sm mt-3 font-medium">
                            Received: {new Date(latestAlert.eventTime).toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Current Weather */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Thermometer size={80} />
                    </div>
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <Thermometer className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Temperature</p>
                            <p className="text-3xl font-display font-bold text-gray-900">{current.temp}°C</p>
                            {weather?.location && <p className="text-xs text-gray-400 mt-1">{weather.location}</p>}
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Droplets size={80} />
                    </div>
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Droplets className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Rainfall</p>
                            <p className="text-3xl font-display font-bold text-gray-900">{current.rainfall} <span className="text-lg text-gray-500 font-normal">mm</span></p>
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wind size={80} />
                    </div>
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className="p-3 bg-gray-100 rounded-xl">
                            <Wind className="w-8 h-8 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Wind Speed</p>
                            <p className="text-3xl font-display font-bold text-gray-900">{current.windSpeed} <span className="text-lg text-gray-500 font-normal">km/h</span></p>
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Cloud size={80} />
                    </div>
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className="p-3 bg-primary-50 rounded-xl">
                            <Cloud className="w-8 h-8 text-primary-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Condition</p>
                            <p className="text-xl font-display font-bold text-gray-900">{current.condition}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Alerts Summary */}
            {alerts.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-display font-bold text-gray-900">Recent Alerts</h2>
                        <a href="/alerts" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1">
                            View All <ArrowUpRight size={16} />
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alerts.slice(0, 6).map((alert) => (
                            <Card key={alert.id} className="p-4 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{alert.cropName}</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">{alert.alertType}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(alert.eventTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
