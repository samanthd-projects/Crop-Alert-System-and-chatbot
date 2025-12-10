import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { cropAPI } from '../utils/api';
import { auth } from '../utils/auth';

export default function CropForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const user = auth.getUser();
  const farmerId = user?.id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    season: '',
    minTemp: '',
    maxTemp: '',
    minRain: '',
    maxRain: '',
    minWind: '',
    maxWind: '',
    emailEnabled: true,
  });

  useEffect(() => {
    if (!isEdit || !id) return;

    const loadCrop = async () => {
      try {
        setLoading(true);
        const crop = await cropAPI.getCrop(id);
        setFormData({
          cropName: crop.cropName || '',
          season: crop.season || '',
          minTemp: crop.minTemp ?? '',
          maxTemp: crop.maxTemp ?? '',
          minRain: crop.minRain ?? '',
          maxRain: crop.maxRain ?? '',
          minWind: crop.minWind ?? '',
          maxWind: crop.maxWind ?? '',
          emailEnabled: crop.emailEnabled !== false,
        });
      } catch (err) {
        console.error('Error loading crop:', err);
        alert('Could not load crop details.');
        navigate('/crops');
      } finally {
        setLoading(false);
      }
    };

    loadCrop();
  }, [id, isEdit, navigate]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!farmerId) {
      alert('You must be logged in to save crops.');
      return;
    }

    if (!formData.cropName.trim() || !formData.season.trim()) {
      alert('Please fill in crop name and season');
      return;
    }

    const payload = {
      cropName: formData.cropName,
      season: formData.season,
      minTemp: formData.minTemp !== '' ? parseFloat(formData.minTemp) : null,
      maxTemp: formData.maxTemp !== '' ? parseFloat(formData.maxTemp) : null,
      minRain: formData.minRain !== '' ? parseFloat(formData.minRain) : null,
      maxRain: formData.maxRain !== '' ? parseFloat(formData.maxRain) : null,
      minWind: formData.minWind !== '' ? parseFloat(formData.minWind) : null,
      maxWind: formData.maxWind !== '' ? parseFloat(formData.maxWind) : null,
      emailEnabled: formData.emailEnabled,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await cropAPI.updateCrop(id, payload);
      } else {
        await cropAPI.addCrop(payload);
      }
      navigate('/crops');
    } catch (err) {
      console.error('Error saving crop:', err);
      alert('Error saving crop: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!farmerId) {
    return (
      <div className="space-y-8">
        <PageHeader title="Crop Management" description="You must be logged in to manage crops." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Crop Management" description="Loading crop details..." />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={isEdit ? 'Edit Crop' : 'Add New Crop'}
        description={
          isEdit
            ? 'Update the crop thresholds and email alert settings.'
            : 'Create a crop profile with thresholds for weather-based alerts.'
        }
      />

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Crop Name"
              placeholder="e.g. Wheat"
              value={formData.cropName}
              onChange={(e) => handleChange('cropName', e.target.value)}
            />
            <Input
              label="Season"
              placeholder="e.g. Rabi, Kharif, Zaid"
              value={formData.season}
              onChange={(e) => handleChange('season', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Min Temperature (°C)"
              type="number"
              placeholder="e.g. 15"
              value={formData.minTemp}
              onChange={(e) => handleChange('minTemp', e.target.value)}
            />
            <Input
              label="Max Temperature (°C)"
              type="number"
              placeholder="e.g. 35"
              value={formData.maxTemp}
              onChange={(e) => handleChange('maxTemp', e.target.value)}
            />
            <Input
              label="Min Rainfall (mm)"
              type="number"
              placeholder="e.g. 50"
              value={formData.minRain}
              onChange={(e) => handleChange('minRain', e.target.value)}
            />
            <Input
              label="Max Rainfall (mm)"
              type="number"
              placeholder="e.g. 150"
              value={formData.maxRain}
              onChange={(e) => handleChange('maxRain', e.target.value)}
            />
            <Input
              label="Min Wind (km/h)"
              type="number"
              placeholder="e.g. 5"
              value={formData.minWind}
              onChange={(e) => handleChange('minWind', e.target.value)}
            />
            <Input
              label="Max Wind (km/h)"
              type="number"
              placeholder="e.g. 30"
              value={formData.maxWind}
              onChange={(e) => handleChange('maxWind', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <span className="text-sm font-semibold text-gray-900 block">Email Alerts</span>
              <span className="text-xs text-gray-500">
                Receive email notifications when weather crosses thresholds.
              </span>
            </div>
            <ToggleSwitch
              checked={formData.emailEnabled}
              onChange={(checked) => handleChange('emailEnabled', checked)}
            />
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="secondary" onClick={() => navigate('/crops')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Crop'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}


