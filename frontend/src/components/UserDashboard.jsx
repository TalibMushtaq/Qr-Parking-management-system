import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { parkingAPI } from '../services/api';
import CurrentBooking from './CurrentBooking';
import ParkingSlots from './ParkingSlots';

const UserDashboard = ({ setIsLoading }) => {
  const [slots, setSlots] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [slotsResponse, bookingResponse] = await Promise.all([
        parkingAPI.getSlots(),
        parkingAPI.getBooking()
      ]);
      setSlots(slotsResponse.data);
      setCurrentBooking(bookingResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handleBookSlot = async (slotId, vehicleNumber) => {
    try {
      setIsLoading(true);
      await parkingAPI.bookSlot(slotId, vehicleNumber);
      await loadData();
      toast.success(`Slot ${slotId} booked successfully for vehicle ${vehicleNumber}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book slot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setIsLoading(true);
      await parkingAPI.cancelBooking();
      await loadData();
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
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
      {currentBooking && (
        <CurrentBooking booking={currentBooking} onCancel={handleCancelBooking} />
      )}
      <h2 className="text-2xl font-bold mb-6">Available Parking Slots</h2>
      <ParkingSlots slots={slots} onBook={handleBookSlot} />
    </div>
  );
};

export default UserDashboard;

