import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { cropAPI } from '../utils/api';
import { auth } from '../utils/auth';
import { Plus, Edit2, Trash2, Sprout, Mail } from 'lucide-react';

export default function CropList() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = auth.getUser();
  const farmerId = user?.id;

  useEffect(() => {
    if (!farmerId) {
      setLoading(false);
      return;
    }

    const fetchCrops = async () => {
      try {
        setLoading(true);
        const cropsData = await cropAPI.getCrops();
        setCrops(cropsData);
      } catch (err) {
        console.error('Error fetching crops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this crop? This will also delete all related alerts and notifications.')) {
      try {
        await cropAPI.deleteCrop(id);
        // Refresh the crops list after successful deletion
        const cropsData = await cropAPI.getCrops();
        setCrops(cropsData);
      } catch (err) {
        console.error('Error deleting crop:', err);
        const errorMsg = err.message || 'Failed to delete crop. Please try again.';
        alert('Error deleting crop: ' + errorMsg);
      }
    }
  };

  // Note: Authentication is handled by backend via JWT token

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Crop Management" description="Loading..." />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Crop Management"
        description="View and manage your crops and their alert settings."
        action={
          <Button
            onClick={() => navigate('/crops/new')}
            className="shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-5 h-5 mr-2 inline" />
            Add New Crop
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map((crop) => (
          <Card
            key={crop.id}
            className="relative group hover:shadow-xl transition-all duration-300 border-transparent hover:border-primary-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Sprout className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-gray-900">
                    {crop.cropName}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                    {crop.season}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                <button
                  onClick={() => navigate(`/crops/${crop.id}/edit`)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(crop.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Crop Details */}
            <div className="space-y-2 mb-4 pt-4 border-t border-gray-50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Min Temp:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {crop.minTemp?.toFixed(1) || '-'}°C
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Max Temp:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {crop.maxTemp?.toFixed(1) || '-'}°C
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Min Rain:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {crop.minRain?.toFixed(1) || '-'}mm
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Max Rain:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {crop.maxRain?.toFixed(1) || '-'}mm
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Min Wind:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {crop.minWind?.toFixed(1) || '-'}km/h
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Max Wind:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {crop.maxWind?.toFixed(1) || '-'}km/h
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail
                  size={16}
                  className={crop.emailEnabled ? 'text-primary-500' : 'text-gray-400'}
                />
                <span className="text-sm font-medium text-gray-600">Email Alerts</span>
              </div>
              <ToggleSwitch
                checked={crop.emailEnabled !== false}
                onChange={async (checked) => {
                  try {
                    await cropAPI.updateCrop(crop.id, {
                      cropName: crop.cropName,
                      season: crop.season,
                      minTemp: crop.minTemp,
                      maxTemp: crop.maxTemp,
                      minRain: crop.minRain,
                      maxRain: crop.maxRain,
                      minWind: crop.minWind,
                      maxWind: crop.maxWind,
                      emailEnabled: checked,
                    });
                    const cropsData = await cropAPI.getCrops();
                    setCrops(cropsData);
                  } catch (err) {
                    console.error('Error updating email alerts:', err);
                  }
                }}
              />
            </div>
          </Card>
        ))}

        {crops.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No crops added yet</h3>
            <p className="text-gray-500 mt-1 mb-6">
              Start by adding your first crop to track.
            </p>
            <Button onClick={() => navigate('/crops/new')}>
              <Plus className="w-4 h-4 mr-2 inline" />
              Add Crop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


