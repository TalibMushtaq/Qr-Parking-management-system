import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import UserAuth from "./pages/UserAuth";
import AdminAuth from "./pages/AdminAuth";
import UserDashboardPage from "./pages/UserDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSlots from "./pages/admin/AdminSlots";
import AdminScanner from "./pages/admin/AdminScanner";
import AdminStatsPage from "./pages/admin/AdminStats";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/user/login" element={<UserAuth />} />
        <Route path="/user/register" element={<UserAuth />} />
        <Route path="/admin/login" element={<AdminAuth />} />

        {/* Protected Routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="slots" element={<AdminSlots />} />
          <Route path="scanner" element={<AdminScanner />} />
          <Route path="stats" element={<AdminStatsPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
