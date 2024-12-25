import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';
import { Box, CircularProgress } from '@mui/material';

// Layout
import AuthLayout from './components/layouts/AuthLayout';
import MainLayout from './components/layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import DoctorList from './pages/doctors/DoctorList';
import DoctorDetails from './pages/doctors/DoctorDetails';
import BookAppointment from './pages/appointments/BookAppointment';
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentDetails from './pages/appointments/AppointmentDetails';
import EditAppointment from './pages/appointments/EditAppointment';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for existing auth token and fetch user data
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/appointments/:id" element={<AppointmentDetails />} />
        <Route path="/appointments/:id/edit" element={<EditAppointment />} />
        <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route
        path="/"
        element={
          <Navigate to="/dashboard" />
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            <h1>404 - Page Not Found</h1>
          </Box>
        }
      />
    </Routes>
  );
}

export default App;
