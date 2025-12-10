import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import AlertsHistory from './pages/AlertsHistory';
import CropList from './pages/CropList';
import CropForm from './pages/CropForm';
import NotificationPreferences from './pages/NotificationPreferences';
import Profile from './pages/Profile';
import { auth } from './utils/auth';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { farmerAPI } from './utils/api';

function RequireAuth({ children }) {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // If already authenticated (token present), skip login/signup screen
  if (auth.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        // First, create the account
        await farmerAPI.signup({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          location: form.location,
        });
        // Immediately log in to get JWT and auto-redirect
        const res = await farmerAPI.login({
          email: form.email,
          password: form.password,
        });
        if (res.token) {
          window.location.href = '/';
          return;
        }
      } else {
        const res = await farmerAPI.login({
          email: form.email,
          password: form.password,
        });
        if (res.token) {
          window.location.href = '/';
          return;
        }
      }
    } catch (err) {
      console.error('Auth error', err);
      const errorMsg = err.message || 'Authentication error. Please check details and try again.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-display font-bold text-gray-900">
            {isSignup ? 'Create your account' : 'Sign in to AgriAlert'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isSignup
              ? 'Monitor your crops with weather-based alerts.'
              : 'Enter your details to access your dashboard.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignup && (
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
          {isSignup && (
            <>
              <Input
                label="Phone Number"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
              <Input
                label="Location"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </>
          )}
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isSignup
              ? 'Sign up'
              : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="text-primary-600 hover:text-primary-700 font-medium"
            onClick={() => setIsSignup((v) => !v)}
          >
            {isSignup ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </Card>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="alerts" element={<AlertsHistory />} />
          <Route path="crops" element={<CropList />} />
          <Route path="crops/new" element={<CropForm />} />
          <Route path="crops/:id/edit" element={<CropForm />} />
          <Route path="notifications" element={<NotificationPreferences />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
