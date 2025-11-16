import React, { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

const ParkingSlots = ({ slots, onReserve, user }) => {
  const [vehicleNumbers, setVehicleNumbers] = useState({});

  // Pre-fill vehicle number from user profile when component mounts
  React.useEffect(() => {
    if (user?.vehicleNumber) {
      const initialVehicleNumbers = {};
      slots.forEach((slot) => {
        initialVehicleNumbers[slot.id] = user.vehicleNumber;
      });
      setVehicleNumbers(initialVehicleNumbers);
    }
  }, [user, slots]);

  const handleVehicleChange = (slotId, value) => {
    setVehicleNumbers({ ...vehicleNumbers, [slotId]: value.toUpperCase() });
  };

  const handleReserve = (slotId) => {
    const vehicleNumber = vehicleNumbers[slotId]?.trim();

    if (!vehicleNumber) {
      toast.error("Please enter a vehicle number");
      return;
    }

    if (!/^[A-Z0-9]{4,10}$/.test(vehicleNumber)) {
      toast.error(
        "Vehicle number should be 4-10 characters (letters and numbers only)"
      );
      return;
    }

    // Backend will automatically calculate arrival time as 1 hour from now
    onReserve(slotId, vehicleNumber);
    setVehicleNumbers({ ...vehicleNumbers, [slotId]: "" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {slots.map((slot) => (
        <Card
          key={slot.id}
          className="relative border-green-500 border-2 bg-green-50"
        >
          <CardContent className="p-6 space-y-4">
            <div className="absolute top-2 left-2 font-bold text-lg">
              {slot.id}
            </div>
            <div className="text-center pt-4">
              <div className="text-green-600 font-medium mb-4">Available</div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`vehicle-${slot.id}`} className="text-sm">
                    Vehicle Number {user?.vehicleNumber && "(from profile)"}
                  </Label>
                  <Input
                    id={`vehicle-${slot.id}`}
                    type="text"
                    placeholder={user?.vehicleNumber || "ABC123"}
                    value={vehicleNumbers[slot.id] || ""}
                    onChange={(e) =>
                      handleVehicleChange(slot.id, e.target.value)
                    }
                    maxLength="10"
                    className="uppercase tracking-wider font-medium"
                  />
                  {user?.vehicleNumber && (
                    <p className="text-xs text-green-600 mt-1">
                      Using vehicle number from your profile
                    </p>
                  )}
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-700 font-medium mb-1">
                    📅 Arrival Time: Automatically set to 1 hour from now
                  </p>
                  <p className="text-xs text-blue-600">
                    You can park after{" "}
                    {new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleReserve(slot.id)}
                >
                  Reserve Slot
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ParkingSlots;
