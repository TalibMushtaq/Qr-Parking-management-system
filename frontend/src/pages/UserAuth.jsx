import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import LoadingOverlay from '../components/LoadingOverlay';

const UserAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/user/login';
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginData.email || !loginData.password) {
      toast.error('All fields are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.login(loginData.email, loginData.password);
      if (response.data.user.role === 'admin') {
        toast.error('Please use the admin login page');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      navigate('/user/dashboard');
    } catch (err) {
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const validationErrors = err.response.data.details
          .map((detail) => detail.message)
          .join(', ');
        toast.error(validationErrors);
        setError(validationErrors);
      } else {
        const errorMsg = err.response?.data?.error || 'Login failed';
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (signupData.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(signupData.password)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(signupData.password)) {
      toast.error('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(signupData.password)) {
      toast.error('Password must contain at least one number');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupData.password)) {
      toast.error('Password must contain at least one special character');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.register(
        signupData.name,
        signupData.email,
        signupData.password
      );
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Registration successful!');
      navigate('/user/dashboard');
    } catch (err) {
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const validationErrors = err.response.data.details
          .map((detail) => detail.message)
          .join(', ');
        toast.error(validationErrors);
        setError(validationErrors);
      } else {
        const errorMsg = err.response?.data?.error || 'Registration failed';
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {isLoading && <LoadingOverlay />}
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'User Login' : 'User Sign Up'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Sign in to your user account' : 'Create a new user account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="loginPassword"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">Login</Button>
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/user/register" className="text-blue-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signupName">Full Name</Label>
                  <Input
                    id="signupName"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showSignupPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupConfirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signupConfirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData({ ...signupData, confirmPassword: e.target.value })
                      }
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">Sign Up</Button>
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/user/login" className="text-blue-600 hover:underline">
                    Login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAuth;

