import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import AdminStats from '../../components/AdminStats';
import LoadingOverlay from '../../components/LoadingOverlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';

const AdminOverview = () => {
  const { setIsLoading } = useOutletContext();
  const [stats, setStats] = useState({ totalSlots: 0, availableSlots: 0, occupiedSlots: 0 });
  const [loading, setLoading] = useState(true);
  const [recentSlots, setRecentSlots] = useState([]);

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
      
      // Get recently occupied slots
      const occupied = slotsResponse.data
        .filter(slot => slot.status === 'occupied')
        .sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime))
        .slice(0, 5);
      setRecentSlots(occupied);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const occupancyRate = stats.totalSlots > 0 
    ? ((stats.occupiedSlots / stats.totalSlots) * 100).toFixed(1)
    : 0;

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <AdminStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {stats.occupiedSlots} of {stats.totalSlots} slots occupied
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest parking slot bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSlots.length > 0 ? (
              <div className="space-y-3">
                {recentSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Slot {slot.id}</p>
                      <p className="text-sm text-gray-600">{slot.vehicleNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(slot.bookingTime).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(slot.bookingTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent bookings</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;

