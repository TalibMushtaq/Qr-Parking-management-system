import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import LoadingOverlay from '../../components/LoadingOverlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { RefreshCw, TrendingUp, Car, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';

const AdminStatsPage = () => {
  const { setIsLoading } = useOutletContext();
  const [stats, setStats] = useState({ totalSlots: 0, availableSlots: 0, occupiedSlots: 0 });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, slotsResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSlots()
      ]);
      setStats(statsResponse.data);
      setSlots(slotsResponse.data);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const occupancyRate = stats.totalSlots > 0 
    ? ((stats.occupiedSlots / stats.totalSlots) * 100).toFixed(1)
    : 0;

  // Calculate average booking duration
  const occupiedSlots = slots.filter(s => s.status === 'occupied' && s.bookingTime);
  const averageDuration = occupiedSlots.length > 0
    ? occupiedSlots.reduce((acc, slot) => {
        const duration = new Date() - new Date(slot.bookingTime);
        return acc + duration;
      }, 0) / occupiedSlots.length
    : 0;

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed insights into parking management</p>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{stats.totalSlots}</CardTitle>
            <CardDescription>Total Parking Slots</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">{stats.availableSlots}</CardTitle>
            <CardDescription>Available Slots</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">{stats.occupiedSlots}</CardTitle>
            <CardDescription>Occupied Slots</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Occupancy Rate
            </CardTitle>
            <CardDescription>Current parking utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-blue-600">{occupancyRate}%</div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {stats.occupiedSlots} of {stats.totalSlots} slots are currently occupied
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Average Booking Duration
            </CardTitle>
            <CardDescription>Current active bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-purple-600">
                {occupiedSlots.length > 0 ? formatDuration(averageDuration) : '0h 0m'}
              </div>
              <p className="text-sm text-gray-600">
                Average time slots have been occupied
              </p>
              <p className="text-xs text-gray-500">
                Based on {occupiedSlots.length} active booking{occupiedSlots.length !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-green-600" />
              Slot Distribution
            </CardTitle>
            <CardDescription>Parking slot status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Available</span>
                  <span className="text-sm text-gray-600">
                    {stats.availableSlots} ({((stats.availableSlots / stats.totalSlots) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${(stats.availableSlots / stats.totalSlots) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Occupied</span>
                  <span className="text-sm text-gray-600">
                    {stats.occupiedSlots} ({occupancyRate}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStatsPage;

