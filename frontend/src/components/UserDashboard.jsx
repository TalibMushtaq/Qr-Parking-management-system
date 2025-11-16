import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  LogOut,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  QrCode,
  RefreshCw,
  History,
} from "lucide-react";
import toast from "react-hot-toast";
import { parkingAPI, authAPI } from "../services/api";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import QRCodeSummary from "./QRCodeSummary";
import ReservationCountdown from "./ReservationCountdown";
import ParkingHistory from "./ParkingHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const UserDashboard = ({ setIsLoading }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadData();
    // Refresh user data from server to ensure vehicleNumber is available
    refreshUserData();
  }, []);

  const refreshUserData = async () => {
    try {
      const response = await authAPI.verify();
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error refreshing user data:", error);
      // If token is invalid, user will be redirected by axios interceptor
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [slotsResponse, bookingResponse] = await Promise.all([
        parkingAPI.getSlots(),
        parkingAPI.getBooking(),
      ]);
      setSlots(slotsResponse.data);
      setCurrentBooking(bookingResponse.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleReserveSlot = async (slotId) => {
    if (!user?.vehicleNumber) {
      const vehicleNumber = prompt(
        "Vehicle number not found in your profile. Please enter your vehicle number:"
      );
      if (!vehicleNumber || !/^[A-Z0-9]{4,10}$/i.test(vehicleNumber.trim())) {
        toast.error(
          "Please enter a valid vehicle number (4-10 alphanumeric characters)"
        );
        return;
      }
      // Update user object temporarily
      const updatedUser = {
        ...user,
        vehicleNumber: vehicleNumber.toUpperCase(),
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    try {
      setIsLoading(true);
      const response = await parkingAPI.reserveSlot(slotId, user.vehicleNumber);
      await loadData();
      // Get the arrival time from the response
      const arrivalTime = response.data?.booking?.arrivalTime;
      const arrivalTimeString = arrivalTime
        ? new Date(arrivalTime).toLocaleString()
        : "1 hour from now";
      toast.success(
        `Slot ${slotId} reserved successfully! You can park after ${arrivalTimeString}`
      );
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Failed to reserve slot";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setIsLoading(true);
      await parkingAPI.cancelBooking();
      await loadData();
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to cancel booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOccupied = async () => {
    if (!currentBooking) {
      toast.error("No active booking found");
      return;
    }

    try {
      setIsLoading(true);
      await parkingAPI.requestOccupied();
      await loadData();
      toast.success("Occupied request sent to admin for approval");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to request occupied status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestLeaving = async () => {
    if (!currentBooking) {
      toast.error("No active booking found");
      return;
    }

    try {
      setIsLoading(true);
      await parkingAPI.requestLeaving();
      await loadData();
      toast.success("Leaving request sent for processing");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to request leaving");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservationExpired = () => {
    toast.error("Your reservation has expired. Please make a new reservation.");
    loadData(); // Refresh the data to show updated status
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header with same style as home page */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              QR Parking Management
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Current Booking Section */}
            {currentBooking && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Current Booking
                  </CardTitle>
                  <CardDescription>
                    Your active parking reservation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Countdown Timer for Reserved Status */}
                  {currentBooking && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Debug: Status = {currentBooking.status}, ReservationTime
                        ={" "}
                        {currentBooking.reservationTime
                          ? "Available"
                          : "Missing"}
                      </p>
                    </div>
                  )}

                  {currentBooking.status === "reserved" &&
                    currentBooking.reservationTime && (
                      <div className="mb-6 flex justify-center">
                        <ReservationCountdown
                          reservationTime={currentBooking.reservationTime}
                          onExpired={handleReservationExpired}
                        />
                      </div>
                    )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">
                          Slot {currentBooking.slotId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Floor {currentBooking.floor || "1"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">
                          {currentBooking.vehicleNumber}
                        </p>
                        <p className="text-sm text-gray-600">Vehicle Number</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">
                          {new Date(
                            currentBooking.arrivalTime
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            currentBooking.arrivalTime
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium capitalize">
                          {currentBooking.status}
                        </p>
                        <p className="text-sm text-gray-600">Current Status</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Mark as Occupied - Only available when reserved */}
                    {currentBooking.status === "reserved" && (
                      <Button
                        onClick={handleRequestOccupied}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Occupied
                      </Button>
                    )}

                    {/* Request to Leave - Only available when occupied */}
                    {currentBooking.status === "occupied" && (
                      <Button
                        onClick={handleRequestLeaving}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Request to Leave
                      </Button>
                    )}

                    {/* Status Information */}
                    {currentBooking.status === "leaving" && (
                      <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded">
                        <p className="text-sm text-yellow-700">
                          ⏳ Leaving request submitted. Please wait for admin
                          approval.
                        </p>
                      </div>
                    )}

                    {currentBooking.occupiedRequestStatus === "pending" && (
                      <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded">
                        <p className="text-sm text-blue-700">
                          ⏳ Parking request submitted. Waiting for admin
                          approval.
                        </p>
                      </div>
                    )}

                    {/* Cancel Booking - Available for reserved status */}
                    {currentBooking.status === "reserved" && (
                      <Button
                        onClick={handleCancelBooking}
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel Booking
                      </Button>
                    )}

                    <Button onClick={loadData} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Code Summary */}
            {currentBooking && <QRCodeSummary booking={currentBooking} />}

            {/* Available Slots Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Available Parking Slots
                </CardTitle>
                <CardDescription>
                  {currentBooking
                    ? "You already have an active booking"
                    : "Choose a parking slot to reserve"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {slots
                    .filter((slot) => slot.status === "available")
                    .map((slot) => (
                      <Card
                        key={slot.id}
                        className="border-2 hover:border-blue-300 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold">Slot {slot.id}</h3>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Floor: {slot.floor || "1"}
                          </p>
                          <Button
                            onClick={() => handleReserveSlot(slot.id)}
                            disabled={!!currentBooking}
                            className="w-full"
                          >
                            Reserve Slot
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
                {slots.filter((slot) => slot.status === "available").length ===
                  0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No available parking slots at the moment</p>
                    <Button
                      onClick={loadData}
                      variant="outline"
                      className="mt-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Number</p>
                    <p className="font-medium">
                      {user?.vehicleNumber || "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <ParkingHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
