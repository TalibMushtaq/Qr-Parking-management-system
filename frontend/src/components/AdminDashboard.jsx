import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import AdminStats from './AdminStats';
import AdminParkingSlots from './AdminParkingSlots';
import QRScanner from './QRScanner';
import { Button } from './ui/button';

const AdminDashboard = ({ setIsLoading }) => {
  const [stats, setStats] = useState({ totalSlots: 0, availableSlots: 0, occupiedSlots: 0 });
  const [slots, setSlots] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
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
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handleReleaseSlot = async (slotId) => {
    if (!window.confirm(`Are you sure you want to release slot ${slotId}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await adminAPI.releaseSlot(slotId);
      await loadData();
      toast.success(`Slot ${slotId} released successfully`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to release slot');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <Button onClick={() => setShowScanner(!showScanner)}>
          {showScanner ? 'Close Scanner' : 'Scan QR Code'}
        </Button>
      </div>

      <AdminStats stats={stats} />

      {showScanner && (
        <QRScanner setIsLoading={setIsLoading} onClose={() => setShowScanner(false)} />
      )}

      <h2 className="text-2xl font-bold mb-6 mt-8">Manage Parking Slots</h2>
      <AdminParkingSlots slots={slots} onRelease={handleReleaseSlot} />
    </div>
  );
};

export default AdminDashboard;

