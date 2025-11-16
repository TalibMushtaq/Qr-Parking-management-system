import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Car,
  Shield,
  QrCode,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Smartphone,
  Zap,
  Globe,
  Award,
} from "lucide-react";

const HomePage = () => {
  const [stats, setStats] = useState({
    totalParkingSlots: 0,
    activeUsers: 0,
    successfulBookings: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Animate stats counting up
    const animateStats = () => {
      setTimeout(
        () =>
          setStats({
            totalParkingSlots: 250,
            activeUsers: 1200,
            successfulBookings: 5600,
          }),
        500
      );
    };
    animateStats();
  }, []);

  const features = [
    {
      icon: QrCode,
      title: "QR Code Technology",
      description:
        "Scan to book, scan to enter, scan to exit - it's that simple",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for smartphones with intuitive touch interface",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Live parking availability and instant booking confirmation",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "End-to-end encryption with secure payment processing",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: MapPin,
      title: "GPS Navigation",
      description: "Find your exact parking spot with integrated navigation",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Reserve your spot in under 30 seconds",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Professional",
      comment:
        "QR Parking has revolutionized my daily commute. No more circling around looking for parking!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "College Student",
      comment:
        "Super convenient app. I can book parking from my dorm and never worry about being late to class.",
      rating: 5,
    },
    {
      name: "Lisa Rodriguez",
      role: "Retail Manager",
      comment:
        "The admin dashboard makes managing our parking facility so much easier. Highly recommend!",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  QR Parking
                </h1>
                <p className="text-xs text-gray-500">Smart Parking Solutions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/user/login">
                <Button variant="ghost" className="hover:bg-blue-50">
                  User Login
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center py-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="h-4 w-4" />
              #1 Parking Management System
            </span>
          </div>

          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Smart Parking
            </span>
            <br />
            <span className="text-gray-700">Made Simple</span>
          </h2>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform your parking experience with cutting-edge QR technology.
            Book instantly, park effortlessly, and manage seamlessly with our
            intelligent parking management system.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/user/register">
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Start Parking Smart
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Manage Facility
              </Button>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalParkingSlots}+
              </div>
              <div className="text-gray-600">Parking Slots</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.activeUsers}+
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats.successfulBookings}+
              </div>
              <div className="text-gray-600">Successful Bookings</div>
            </div>
          </div>
        </div>

        {/* Enhanced Features */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose QR Parking?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of parking with features designed for modern
              urban mobility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* User/Admin Options with Enhanced Design */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Experience
            </h3>
            <p className="text-xl text-gray-600">
              Whether you're parking or managing, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
                <CardTitle className="text-3xl flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Car className="h-8 w-8" />
                  </div>
                  For Drivers
                </CardTitle>
                <CardDescription className="text-blue-100 text-lg">
                  Experience hassle-free parking with smart technology
                </CardDescription>
              </div>
              <CardContent className="p-8">
                <div className="space-y-4 mb-8">
                  {[
                    "Instant slot booking & confirmation",
                    "Real-time parking availability",
                    "QR code-based entry/exit system",
                    "Digital payment integration",
                    "Booking history & analytics",
                    "GPS navigation to your spot",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <Link to="/user/register" className="block">
                    <Button className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 group">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/user/login" className="block">
                    <Button
                      variant="outline"
                      className="w-full text-lg py-6 border-2 hover:bg-blue-50"
                    >
                      Already have an account? Sign in
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 text-white">
                <CardTitle className="text-3xl flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Shield className="h-8 w-8" />
                  </div>
                  For Admins
                </CardTitle>
                <CardDescription className="text-purple-100 text-lg">
                  Powerful tools to manage your parking facility
                </CardDescription>
              </div>
              <CardContent className="p-8">
                <div className="space-y-4 mb-8">
                  {[
                    "Comprehensive analytics dashboard",
                    "Real-time slot management",
                    "User management & verification",
                    "Revenue tracking & reporting",
                    "QR code generation & validation",
                    "System health monitoring",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <Link to="/admin/login" className="block">
                    <Button className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group">
                      Access Admin Portal
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-20 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h3>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied users who've transformed their parking
              experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="py-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 mx-auto max-w-4xl text-white shadow-2xl">
            <h3 className="text-4xl font-bold mb-4">
              Ready to Transform Your Parking Experience?
            </h3>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of users who've made parking effortless with QR
              technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/user/register">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg"
                >
                  Start Your Free Account
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    QR Parking
                  </h3>
                  <p className="text-xs text-gray-400">
                    Smart Parking Solutions
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Revolutionizing urban mobility with intelligent parking
                solutions. Making parking effortless for drivers and profitable
                for facility owners.
              </p>
              <div className="flex gap-4">
                <div className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <div className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    to="/user/register"
                    className="hover:text-white transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/login"
                    className="hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/login"
                    className="hover:text-white transition-colors"
                  >
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a
                    href="#help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 QR Parking Management System. All rights reserved.
              </p>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className="text-sm text-gray-400">
                  Made with ❤️ for smarter cities
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
