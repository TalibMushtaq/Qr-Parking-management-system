import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "admin@parking.com", // Pre-filled for easy testing
    password: "Admin@123", // Pre-filled for easy testing
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");

  // Check backend connectivity on component load
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/verify", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok || response.status === 401) {
          // 401 is fine, means backend is up
          setBackendStatus("online");
        } else {
          setBackendStatus("error");
        }
      } catch (error) {
        setBackendStatus("offline");
      }
    };

    checkBackend();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.adminLogin(
        formData.email,
        formData.password
      );

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        toast.success("Admin login successful!");

        // Small delay to ensure token is stored before navigation
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 100);
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      let errorMessage = "Login failed - ";

      if (!error.response) {
        errorMessage +=
          "Cannot connect to server. Is the backend running on port 5000?";
      } else if (error.response.status === 401) {
        errorMessage += "Invalid credentials";
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else {
        errorMessage += "Unknown error occurred";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Admin Login
            </CardTitle>
            <CardDescription>Access the admin dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="admin@parking.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Admin@123"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <strong>Test Credentials:</strong>
                <br />
                Email: admin@parking.com
                <br />
                Password: Admin@123
              </div>

              {/* Backend Status Indicator */}
              <div
                className={`p-3 rounded-lg text-sm ${
                  backendStatus === "online"
                    ? "bg-green-50 text-green-800"
                    : backendStatus === "offline"
                    ? "bg-red-50 text-red-800"
                    : backendStatus === "error"
                    ? "bg-yellow-50 text-yellow-800"
                    : "bg-gray-50 text-gray-800"
                }`}
              >
                <strong>Backend Status:</strong>{" "}
                {backendStatus === "online" && "✅ Connected"}
                {backendStatus === "offline" &&
                  "❌ Offline - Start backend server"}
                {backendStatus === "error" && "⚠️ Error connecting"}
                {backendStatus === "checking" && "🔄 Checking..."}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || backendStatus !== "online"}
              >
                {isLoading
                  ? "Signing in..."
                  : backendStatus !== "online"
                  ? "Backend Offline"
                  : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
