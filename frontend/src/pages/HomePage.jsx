import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Car, Shield, QrCode, Clock } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              QR Parking Management
            </h1>
            <div className="flex gap-4">
              <Link to="/user/login">
                <Button variant="outline">User Login</Button>
              </Link>
              <Link to="/admin/login">
                <Button>Admin Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Smart Parking Management System
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Effortlessly manage parking spaces with QR code technology. Book, track, and manage your parking slots in real-time.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/user/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started as User
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <QrCode className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>QR Code Booking</CardTitle>
              <CardDescription>
                Quick and easy booking using QR code technology
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Real-Time Tracking</CardTitle>
              <CardDescription>
                Monitor parking availability in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Car className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Vehicle Management</CardTitle>
              <CardDescription>
                Track your vehicle and booking history
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>
                Secure authentication and data protection
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* User/Admin Options */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Car className="h-6 w-6 text-blue-600" />
                For Users
              </CardTitle>
              <CardDescription className="text-base">
                Book parking slots, manage your bookings, and track your vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-gray-600">
                <li>✓ Quick slot booking</li>
                <li>✓ Real-time availability</li>
                <li>✓ Booking management</li>
                <li>✓ QR code scanning</li>
              </ul>
              <div className="flex gap-3">
                <Link to="/user/login" className="flex-1">
                  <Button className="w-full">Login</Button>
                </Link>
                <Link to="/user/register" className="flex-1">
                  <Button variant="outline" className="w-full">Sign Up</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                For Administrators
              </CardTitle>
              <CardDescription className="text-base">
                Manage parking slots, view statistics, and control system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-gray-600">
                <li>✓ Dashboard analytics</li>
                <li>✓ Slot management</li>
                <li>✓ QR code generation</li>
                <li>✓ System monitoring</li>
              </ul>
              <div className="flex gap-3">
                <Link to="/admin/login" className="flex-1">
                  <Button className="w-full">Admin Login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400">
            © 2024 QR Parking Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

