import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { mockSettings } from '../utils/mockData';
import { Thermometer, CloudRain, Wind, Save } from 'lucide-react';

export default function AlertSettings() {
    const [thresholds, setThresholds] = useState(mockSettings.thresholds);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (key, field, value) => {
        setThresholds(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
        setIsDirty(true);
    };

    const handleSave = () => {
        console.log('Saving settings:', thresholds);
        setIsDirty(false);
        alert('Settings saved successfully!');
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Alert Settings"
                description="Configure thresholds for when you want to receive alerts."
                action={
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className="shadow-lg shadow-primary-500/20"
                    >
                        <Save className="w-4 h-4 mr-2 inline" />
                        Save Changes
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Temperature Settings */}
                <Card className="border-t-4 border-t-orange-500">
                    <div className="flex items-center mb-8">
                        <div className="p-3 bg-orange-50 rounded-2xl mr-4">
                            <Thermometer className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-gray-900">Temperature</h2>
                            <p className="text-sm text-gray-500">Manage heat and cold alerts</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between space-x-6">
                                <div className="flex-1">
                                    <Input
                                        label="High Temperature Threshold (°C)"
                                        type="number"
                                        value={thresholds.highTemp.value}
                                        onChange={(e) => handleChange('highTemp', 'value', parseInt(e.target.value))}
                                        className="font-mono text-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Trigger alert when temperature rises above this value.</p>
                                </div>
                                <div className="pt-8">
                                    <ToggleSwitch
                                        checked={thresholds.highTemp.enabled}
                                        onChange={(checked) => handleChange('highTemp', 'enabled', checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between space-x-6">
                                <div className="flex-1">
                                    <Input
                                        label="Low Temperature Threshold (°C)"
                                        type="number"
                                        value={thresholds.lowTemp.value}
                                        onChange={(e) => handleChange('lowTemp', 'value', parseInt(e.target.value))}
                                        className="font-mono text-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Trigger alert when temperature drops below this value.</p>
                                </div>
                                <div className="pt-8">
                                    <ToggleSwitch
                                        checked={thresholds.lowTemp.enabled}
                                        onChange={(checked) => handleChange('lowTemp', 'enabled', checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Rainfall & Wind Settings */}
                <Card className="border-t-4 border-t-blue-500">
                    <div className="flex items-center mb-8">
                        <div className="p-3 bg-blue-50 rounded-2xl mr-4">
                            <CloudRain className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-gray-900">Weather Events</h2>
                            <p className="text-sm text-gray-500">Rainfall and wind speed limits</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between space-x-6">
                                <div className="flex-1">
                                    <Input
                                        label="Heavy Rainfall Threshold (mm)"
                                        type="number"
                                        value={thresholds.rainfall.value}
                                        onChange={(e) => handleChange('rainfall', 'value', parseInt(e.target.value))}
                                        className="font-mono text-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Trigger alert when rainfall exceeds this value.</p>
                                </div>
                                <div className="pt-8">
                                    <ToggleSwitch
                                        checked={thresholds.rainfall.enabled}
                                        onChange={(checked) => handleChange('rainfall', 'enabled', checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between space-x-6">
                                <div className="flex-1">
                                    <Input
                                        label="High Wind Speed Threshold (km/h)"
                                        type="number"
                                        value={thresholds.windSpeed.value}
                                        onChange={(e) => handleChange('windSpeed', 'value', parseInt(e.target.value))}
                                        className="font-mono text-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Trigger alert when wind speed exceeds this value.</p>
                                </div>
                                <div className="pt-8">
                                    <ToggleSwitch
                                        checked={thresholds.windSpeed.enabled}
                                        onChange={(checked) => handleChange('windSpeed', 'enabled', checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
