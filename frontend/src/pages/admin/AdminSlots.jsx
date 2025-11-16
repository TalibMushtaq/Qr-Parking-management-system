import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import AdminParkingSlots from '../../components/AdminParkingSlots';
import LoadingOverlay from '../../components/LoadingOverlay';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Search, Filter, RefreshCw } from 'lucide-react';

const AdminSlots = () => {
  const { setIsLoading } = useOutletContext();
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, available, occupied

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSlots();
  }, [slots, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getSlots();
      const sortedSlots = response.data.sort((a, b) => {
        const sectionA = a.id.split('-')[0];
        const sectionB = b.id.split('-')[0];
        if (sectionA !== sectionB) {
          return sectionA.localeCompare(sectionB);
        }
        return parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]);
      });
      setSlots(sortedSlots);
    } catch (error) {
      toast.error('Failed to load parking slots');
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const filterSlots = () => {
    let filtered = slots;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(slot => slot.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        slot =>
          slot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (slot.vehicleNumber &&
            slot.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSlots(filtered);
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
    return <LoadingOverlay />;
  }

  const availableCount = slots.filter(s => s.status === 'available').length;
  const occupiedCount = slots.filter(s => s.status === 'occupied').length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parking Slots Management</h1>
          <p className="text-gray-600 mt-1">View and manage all parking slots</p>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{slots.length}</CardTitle>
            <CardDescription>Total Slots</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">{availableCount}</CardTitle>
            <CardDescription>Available</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">{occupiedCount}</CardTitle>
            <CardDescription>Occupied</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by slot ID or vehicle number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'available' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('available')}
                className="bg-green-600 hover:bg-green-700"
              >
                Available
              </Button>
              <Button
                variant={statusFilter === 'occupied' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('occupied')}
                className="bg-red-600 hover:bg-red-700"
              >
                Occupied
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Slots ({filteredSlots.length})
        </h2>
        <AdminParkingSlots slots={filteredSlots} onRelease={handleReleaseSlot} />
      </div>
    </div>
  );
};

export default AdminSlots;

