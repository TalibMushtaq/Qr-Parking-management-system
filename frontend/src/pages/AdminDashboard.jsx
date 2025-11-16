import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  LogOut,
  Users,
  BarChart3,
  Settings,
  QrCode,
  Clock,
  Shield,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  UserCheck,
  UserX,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);

    try {
      // Test individual API calls to see which ones fail
      let statsRes;
      try {
        statsRes = await adminAPI.getStats();
      } catch (statsError) {
        statsRes = null;
      }

      let usersRes;
      try {
        usersRes = await adminAPI.getUsers();
      } catch (usersError) {
        usersRes = { data: { users: [] } };
      }

      let slotsRes;
      try {
        slotsRes = await adminAPI.getSlots();
      } catch (slotsError) {
        slotsRes = { data: [] };
      }

      let requestsRes;
      try {
        requestsRes = await adminAPI.getRequests();
      } catch (requestsError) {
        requestsRes = { data: [] };
      }

      if (statsRes) {
        setStats(statsRes.data);
      } else {
        // Set default stats if API fails
        setStats({
          parking: {
            totalSlots: 0,
            availableSlots: 0,
            occupiedSlots: 0,
            reservedSlots: 0,
            maintenanceSlots: 0,
          },
          users: { totalUsers: 0, activeUsers: 0, blockedUsers: 0 },
          requests: { pendingOccupiedRequests: 0, pendingLeavingRequests: 0 },
        });
      }

      // Handle users data - check if it's the direct array or wrapped in an object
      const usersData = usersRes.data;
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else if (usersData && Array.isArray(usersData.users)) {
        setUsers(usersData.users);
      } else {
        setUsers([]);
      }

      // Handle slots data
      setParkingSlots(Array.isArray(slotsRes.data) ? slotsRes.data : []);

      // Handle requests data
      setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
    } catch (error) {
      toast.error(
        "Failed to load dashboard data: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleBlockUser = async (userId) => {
    try {
      await adminAPI.blockUser(userId);
      toast.success("User blocked successfully");
      fetchAllData(); // Refresh data
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await adminAPI.unblockUser(userId);
      toast.success("User unblocked successfully");
      fetchAllData(); // Refresh data
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  };

  const handleResetAllRequests = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset ALL pending requests? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await adminAPI.resetAllRequests();
      toast.success(response.data.message || "All requests reset successfully");
      fetchAllData(); // Refresh data
    } catch (error) {
      toast.error(
        "Failed to reset requests: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleApproveRequest = async (request) => {
    try {
      if (request.occupiedRequestStatus === "pending") {
        await adminAPI.approveOccupied(request.id);
        toast.success("Occupied request approved");
      } else if (request.leavingRequestStatus === "pending") {
        // For leaving requests, check payment status first
        if (request.paymentStatus !== "paid") {
          toast.error(
            "Payment must be marked as received before approving leaving request"
          );
          return;
        }
        await adminAPI.approveLeaving(request.id);
        toast.success("Leaving request approved");
      }
      fetchAllData(); // Refresh data
    } catch (error) {
      toast.error(
        "Failed to approve request: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleConfirmPayment = async (request) => {
    try {
      await adminAPI.confirmPayment(request.id);
      toast.success("Payment confirmed and exit completed successfully");
      fetchAllData(); // Refresh data
    } catch (error) {
      toast.error(
        "Failed to confirm payment: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleMarkPayment = async (request) => {
    try {
      await adminAPI.markPayment(request.id);
      toast.success("Payment marked as received");
      fetchAllData(); // Refresh data
    } catch (error) {
      toast.error(
        "Failed to mark payment: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      if (request.occupiedRequestStatus === "pending") {
        await adminAPI.rejectOccupied(request.id);
        toast.success("Occupied request rejected");
      }
      fetchAllData(); // Refresh data
    } catch (error) {
      toast.error(
        "Failed to reject request: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.parking?.totalSlots || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.parking?.availableSlots || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.users?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.users?.totalUsers || 0} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Occupied Slots
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.parking?.occupiedSlots || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.parking?.reservedSlots || 0} reserved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.requests?.pendingOccupiedRequests || 0) +
                (stats?.requests?.pendingLeavingRequests || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Require approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest parking and user activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.slice(0, 5).map((request, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Parking Request</p>
                    <p className="text-sm text-gray-600">
                      Slot {request.slotNumber || "Unknown"}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={fetchAllData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isBlocked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        {user.role !== "admin" &&
                          (user.isBlocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnblockUser(user._id)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBlockUser(user._id)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderParkingSlots = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Parking Slots</h2>
        <Button onClick={fetchAllData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {parkingSlots.map((slot) => (
          <Card key={slot._id} className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Slot {slot.slotNumber}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    slot.status === "available"
                      ? "bg-green-100 text-green-800"
                      : slot.status === "occupied"
                      ? "bg-red-100 text-red-800"
                      : slot.status === "reserved"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {slot.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Floor: {slot.floor}</p>
              {slot.currentUser && (
                <p className="text-sm font-medium">
                  User: {slot.currentUser.name}
                </p>
              )}
              {slot.qrCode && (
                <div className="mt-2">
                  <QrCode className="h-4 w-4 inline mr-1" />
                  <span className="text-xs text-gray-500">QR Available</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {parkingSlots.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No parking slots found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pending Requests</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleResetAllRequests}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={requests.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button onClick={fetchAllData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Slot</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((request, index) => (
                  <tr key={request._id || index} className="hover:bg-gray-50">
                    <td className="p-4">
                      {request.bookedBy?.name || "Unknown User"}
                    </td>
                    <td className="p-4">Slot {request.id || "N/A"}</td>
                    <td className="p-4">
                      <span className="capitalize">
                        {request.occupiedRequestStatus === "pending"
                          ? "Occupied"
                          : request.leavingRequestStatus === "pending"
                          ? "Leaving"
                          : "Unknown"}
                      </span>
                    </td>
                    <td className="p-4">
                      {request.leavingRequestStatus === "pending" ? (
                        <div className="space-y-1">
                          <div
                            className={`text-sm px-2 py-1 rounded ${
                              request.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : request.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {request.paymentStatus === "paid"
                              ? "✅ Paid"
                              : request.paymentStatus === "pending"
                              ? "⏳ Pending"
                              : "❌ Not Set"}
                          </div>
                          {request.cost && (
                            <div className="text-xs text-gray-600">
                              ₹{request.cost}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                      {request.occupiedRequestTime
                        ? new Date(
                            request.occupiedRequestTime
                          ).toLocaleDateString()
                        : request.leavingRequestTime
                        ? new Date(
                            request.leavingRequestTime
                          ).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2 flex-wrap">
                        {/* For occupied requests */}
                        {request.occupiedRequestStatus === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveRequest(request)}
                              className="text-green-600 hover:text-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {/* For leaving requests */}
                        {request.leavingRequestStatus === "pending" && (
                          <div className="flex flex-col space-y-1">
                            <Button
                              size="sm"
                              onClick={() => handleConfirmPayment(request)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              Confirm Payment & Exit
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {requests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No pending requests
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header with same style as home page */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              QR Parking Management
              <Shield className="h-6 w-6 text-green-600 ml-2" />
            </h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: "dashboard", label: "Dashboard", icon: BarChart3 },
              { key: "users", label: "Users", icon: Users },
              { key: "slots", label: "Parking Slots", icon: Car },
              { key: "requests", label: "Requests", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "slots" && renderParkingSlots()}
        {activeTab === "requests" && renderRequests()}
      </main>
    </div>
  );
};

export default AdminDashboard;
