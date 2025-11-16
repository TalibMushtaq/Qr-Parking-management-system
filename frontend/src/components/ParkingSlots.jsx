import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

const ParkingSlots = ({ slots, onBook }) => {
  const [vehicleNumbers, setVehicleNumbers] = useState({});

  const handleVehicleChange = (slotId, value) => {
    setVehicleNumbers({ ...vehicleNumbers, [slotId]: value.toUpperCase() });
  };

  const handleBook = (slotId) => {
    const vehicleNumber = vehicleNumbers[slotId]?.trim();
    if (vehicleNumber) {
      onBook(slotId, vehicleNumber);
      setVehicleNumbers({ ...vehicleNumbers, [slotId]: '' });
    } else {
      toast.error('Please enter a vehicle number');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {slots.map((slot) => (
        <Card key={slot.id} className="relative border-green-500 border-2 bg-green-50">
          <CardContent className="p-6 space-y-4">
            <div className="absolute top-2 left-2 font-bold text-lg">{slot.id}</div>
            <div className="text-center pt-4">
              <div className="text-green-600 font-medium mb-4">Available</div>
              <Input
                type="text"
                placeholder="Vehicle Number"
                value={vehicleNumbers[slot.id] || ''}
                onChange={(e) => handleVehicleChange(slot.id, e.target.value)}
                maxLength="10"
                className="uppercase tracking-wider font-medium mb-4"
              />
              <Button
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleBook(slot.id)}
              >
                Book Slot
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ParkingSlots;

