import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { cropAPI } from '../utils/api';
import { Mail, Save } from 'lucide-react';
import { auth } from '../utils/auth';

export default function NotificationPreferences() {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    const user = auth.getUser();
    const farmerId = user?.id || 1;

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                setLoading(true);
                const cropsData = await cropAPI.getCrops(farmerId);
                setCrops(cropsData);
            } catch (err) {
                console.error('Error fetching crops:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCrops();
    }, [farmerId]);

    const handleToggleEmail = async (cropId, currentValue) => {
        try {
            const crop = crops.find(c => c.id === cropId);
            if (!crop) return;

            const updatedCrop = {
                ...crop,
                emailEnabled: !currentValue
            };

            await cropAPI.updateCrop(cropId, farmerId, updatedCrop);
            
            // Update local state
            setCrops(crops.map(c => 
                c.id === cropId ? { ...c, emailEnabled: !currentValue } : c
            ));
            setIsDirty(true);
        } catch (err) {
            console.error('Error updating crop email preference:', err);
            alert('Error updating email preference');
        }
    };

    const handleSave = () => {
        setIsDirty(false);
        alert('Email preferences saved successfully!');
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader title="Notification Preferences" description="Loading..." />
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Notification Preferences"
                description="Manage email alert preferences for each crop."
                action={
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className="shadow-lg shadow-primary-500/20"
                    >
                        <Save className="w-4 h-4 mr-2 inline" />
                        Save Preferences
                    </Button>
                }
            />

            <Card className="h-full">
                <div className="flex items-center mb-8">
                    <div className="p-3 bg-purple-50 rounded-2xl mr-4">
                        <Mail className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold text-gray-900">Email Notifications</h2>
                        <p className="text-sm text-gray-500">Enable or disable email alerts per crop</p>
                    </div>
                </div>

                {crops.length > 0 ? (
                    <div className="space-y-4">
                        {crops.map((crop) => (
                            <div
                                key={crop.id}
                                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{crop.cropName}</p>
                                        <p className="text-sm text-gray-500">{crop.season} Season</p>
                                    </div>
                                </div>
                                <ToggleSwitch
                                    checked={crop.emailEnabled !== false}
                                    onChange={(checked) => handleToggleEmail(crop.id, crop.emailEnabled)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No crops found. Add crops in Crop Management to configure email notifications.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
