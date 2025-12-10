import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { alertAPI, notificationAPI } from '../utils/api';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { auth } from '../utils/auth';

export default function AlertsHistory() {
    const [alerts, setAlerts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState('');

    // Get farmer ID from auth
    const user = auth.getUser();
    const farmerId = user?.id || 1;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [alertsData, notificationsData] = await Promise.all([
                    alertAPI.getAlertsByFarmer(farmerId),
                    notificationAPI.getAllNotifications()
                ]);
                setAlerts(alertsData);
                setNotifications(notificationsData);
            } catch (err) {
                console.error('Error fetching alerts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [farmerId]);

    // Create a map of notifications by event ID
    const notificationMap = notifications.reduce((acc, notif) => {
        acc[notif.eventId] = notif;
        return acc;
    }, {});

    const filteredAlerts = alerts.filter(alert => {
        const matchesName = searchName ? 
            (alert.cropName?.toLowerCase().includes(searchName.toLowerCase()) || 
             alert.alertType?.toLowerCase().includes(searchName.toLowerCase())) : true;
        return matchesName;
    });

    const clearFilters = () => {
        setSearchName('');
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader title="Alerts History" description="Loading alerts..." />
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-500">Loading alerts from backend...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Alerts History"
                description="View past weather alerts and email delivery status."
            />

            {/* Filters */}
            <Card className="mb-6 bg-white/50 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1">
                        <Input
                            label="Search by Crop Name or Alert Type"
                            placeholder="e.g. Tomato, Temperature"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            icon={<Search size={18} />}
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <Button
                            variant="secondary"
                            onClick={clearFilters}
                            className="w-full md:w-auto"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Alerts Table */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Crop Name + Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Threshold Temperature</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Threshold Rainfall</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Threshold Wind Speed</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Sent</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Sent Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {filteredAlerts.length > 0 ? (
                                filteredAlerts.map((alert) => {
                                    const notification = notificationMap[alert.id];
                                    const emailSent = notification?.emailStatus === 'Sent';
                                    return (
                                        <tr key={alert.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{alert.cropName}</span>
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 mt-1 w-fit">
                                                        {alert.alertType}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {alert.thresholdValue?.toFixed(1)}°C
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {alert.rainfall?.toFixed(1)} mm
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {alert.wind?.toFixed(1)} km/h
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {emailSent ? (
                                                    <div className="flex justify-center">
                                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center">
                                                        <XCircle className="w-5 h-5 text-red-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {notification?.emailSentAt ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(notification.emailSentAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(notification.emailSentAt).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="p-3 bg-gray-50 rounded-full mb-3">
                                                <Search className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="font-medium">No alerts found matching your search.</p>
                                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
