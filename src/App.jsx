import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Webinars from './pages/Webinars';
import WebinarDetail from './pages/WebinarDetail';
import Dashboard from './pages/Dashboard';
import MyWebinars from './pages/MyWebinars';

// Admin Portal Pages
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminWebinars from './pages/AdminWebinars';
import AdminResources from './pages/AdminResources';
import AdminUsers from './pages/AdminUsers';

import './App.css';

function App() {
  useEffect(() => {
    // Keep backend alive on Render free tier (ping every 10 minutes)
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://fsadproject-backend.onrender.com';
    const keepAlive = setInterval(() => {
      fetch(`${API_BASE}/health`)
        .catch(() => {});
    }, 600000);
    return () => clearInterval(keepAlive);
  }, []);

  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff' } }} />
      <Router>
        <div className="app-container">
          <Routes>
            {/* Admin Layout routes have their own Navbar */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="webinars" element={<AdminWebinars />} />
              <Route path="resources" element={<AdminResources />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* Main Layout routes with regular Navbar */}
            <Route path="*" element={
              <>
                <Navbar />
                <main className="main-content">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/webinars" element={<Webinars />} />
                    <Route path="/webinars/:id" element={<WebinarDetail />} />

                    {/* Protected Routes — Requires Login */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-webinars" element={
                      <ProtectedRoute>
                        <MyWebinars />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
