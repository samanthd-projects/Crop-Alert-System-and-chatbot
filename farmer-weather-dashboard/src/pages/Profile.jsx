import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { farmerAPI } from '../utils/api';
import { User, MapPin, Phone, Mail, Camera, CloudSun, Thermometer, Droplets, Wind } from 'lucide-react';
import { auth } from '../utils/auth';

export default function Profile() {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        location: ''
    });
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [isProfileDirty, setIsProfileDirty] = useState(false);
    const [loading, setLoading] = useState(true);

    const user = auth.getUser();

    useEffect(() => {
        const fetchProfileAndWeather = async () => {
            try {
                setLoading(true);
                // Fetch profile using JWT token
                const farmerData = await farmerAPI.getProfile();
                setProfile({
                    name: farmerData.name || '',
                    email: farmerData.email || '',
                    phone: farmerData.phone || '',
                    location: farmerData.location || ''
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }

            // Fetch weather separately so profile appears quickly
            try {
                setWeatherLoading(true);
                const weatherData = await farmerAPI.getProfileWeather();
                setWeather(weatherData);
            } catch (err) {
                console.error('Error fetching profile weather:', err);
            } finally {
                setWeatherLoading(false);
            }
        };
        fetchProfileAndWeather();
    }, []);

    const handleProfileChange = (key, value) => {
        setProfile(prev => ({ ...prev, [key]: value }));
        setIsProfileDirty(true);
    };

    const handleSaveProfile = async () => {
        try {
            // Profile updates should be done via a dedicated endpoint;
            // for now, just update local state and notify user.
            // Backend currently exposes read-only profile via JWT.
            alert('Profile updates are not yet wired to backend. Only display is supported.');
            setIsProfileDirty(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Error updating profile');
        }
    };

    const handleLogout = () => {
        auth.clear();
        window.location.href = '/login';
    };

    const currentWeather = weather ? {
        temp: weather.temperature?.toFixed(1),
        rainfall: weather.rainfall?.toFixed(1),
        windSpeed: weather.windSpeed?.toFixed(1),
        condition: weather.condition,
        location: weather.location
    } : null;

    /*
     * If later you enable profile update via JWT endpoint,
     * you can send this payload to the backend:
     * {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                location: profile.location,
                password: ''
            }
     */

    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader title="My Profile" description="Loading..." />
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    const initials = profile.name
        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <div className="space-y-8">
            <PageHeader
                title="My Profile"
                description="Manage your personal information and account security."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <div className="flex items-center mb-8">
                            <div className="p-3 bg-primary-50 rounded-2xl mr-4">
                                <User className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-gray-900">Personal Information</h2>
                                <p className="text-sm text-gray-500">Update your contact details</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4 relative group cursor-pointer">
                                    {initials}
                                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-500">Change Photo</p>
                            </div>

                            <div className="flex-1 space-y-6">
                                <Input
                                    label="Full Name"
                                    value={profile.name}
                                    onChange={(e) => handleProfileChange('name', e.target.value)}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => handleProfileChange('email', e.target.value)}
                                        icon={<Mail size={18} />}
                                    />
                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                                        icon={<Phone size={18} />}
                                    />
                                </div>

                                <Input
                                    label="Location / Farm Address"
                                    value={profile.location}
                                    onChange={(e) => handleProfileChange('location', e.target.value)}
                                    icon={<MapPin size={18} />}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <Button
                                onClick={handleSaveProfile}
                                disabled={!isProfileDirty}
                                className="shadow-lg shadow-primary-500/20"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Weather summary & account actions (no password change UI) */}
                <div className="lg:col-span-1 space-y-6">
                    {weatherLoading && (
                        <Card className="h-full flex items-center justify-center text-sm text-gray-500">
                            Loading weather...
                        </Card>
                    )}

                    {!weatherLoading && currentWeather && (
                        <Card className="h-full">
                            <div className="flex items-center mb-6">
                                <div className="p-3 bg-sky-50 rounded-2xl mr-4">
                                    <CloudSun className="w-8 h-8 text-sky-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-gray-900">My Weather</h2>
                                    <p className="text-sm text-gray-500">
                                        Current conditions at your saved location
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Thermometer className="w-5 h-5 text-orange-500" />
                                        <span className="text-sm text-gray-600">Temperature</span>
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {currentWeather.temp}°C
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Droplets className="w-5 h-5 text-blue-500" />
                                        <span className="text-sm text-gray-600">Rainfall</span>
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {currentWeather.rainfall} mm
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Wind className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm text-gray-600">Wind Speed</span>
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {currentWeather.windSpeed} km/h
                                    </span>
                                </div>
                                <div className="pt-2 text-xs text-gray-500">
                                    Location: {currentWeather.location}
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card>
                        <div className="space-y-4">
                            <h2 className="text-lg font-display font-bold text-gray-900">Account</h2>
                            <p className="text-sm text-gray-500">
                                You are logged in as <span className="font-medium">{profile.email}</span>.
                            </p>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={handleLogout}
                            >
                                Log out
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
