import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AgriChatbot } from './components/AgriChatbot';
import { LandingHomePage } from './pages/LandingHomePage';
import { AuthPages } from './pages/AuthPages';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { CropManagement } from './pages/CropManagement';
import { SoilAnalysis } from './pages/SoilAnalysis';
import { FertilizerCalculator } from './pages/FertilizerCalculator';
import { Marketplace } from './pages/Marketplace';
import { VendorPortal } from './pages/VendorPortal';
import { ExpertConsultation } from './pages/ExpertConsultation';
import { GovernmentSchemes } from './pages/GovernmentSchemes';
import { NewsUpdates } from './pages/NewsUpdates';
import { FarmExpense } from './pages/FarmExpense';
import { HarvestManagement } from './pages/HarvestManagement';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { AdminPanel } from './pages/AdminPanel';

// Protected Route Wrapper Enforcing Strict Role Access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="card animate-fade-in" style={{ padding: '3rem', textAlign: 'center', margin: '2rem auto', maxWidth: '500px' }}>
        <h3 style={{ color: 'var(--error)' }}>Access Restricted 🚫</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0.8rem 0 1.5rem' }}>
          Your current account role (<strong>{user.role}</strong>) does not have access permissions for this module.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }
  return children;
};

export function App() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px' }}>
          <Routes>
            {/* Public Auth & Guest Landing Home Page */}
            <Route path="/" element={!user ? <LandingHomePage /> : user.role === 'admin' ? <AdminPanel /> : <FarmerDashboard />} />
            <Route path="/login" element={<AuthPages />} />

            {/* Role-Protected Module Routes */}
            <Route path="/crops" element={<ProtectedRoute allowedRoles={['farmer']}><CropManagement /></ProtectedRoute>} />
            <Route path="/soil" element={<ProtectedRoute allowedRoles={['farmer', 'expert']}><SoilAnalysis /></ProtectedRoute>} />
            <Route path="/fertilizers" element={<ProtectedRoute allowedRoles={['farmer', 'expert']}><FertilizerCalculator /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute allowedRoles={['farmer', 'vendor']}><Marketplace /></ProtectedRoute>} />
            <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorPortal /></ProtectedRoute>} />
            <Route path="/expert" element={<ProtectedRoute allowedRoles={['farmer', 'expert']}><ExpertConsultation /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute allowedRoles={['farmer', 'expert']}><GovernmentSchemes /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute allowedRoles={['farmer', 'expert', 'vendor']}><NewsUpdates /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute allowedRoles={['farmer']}><FarmExpense /></ProtectedRoute>} />
            <Route path="/harvest" element={<ProtectedRoute allowedRoles={['farmer']}><HarvestManagement /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={['farmer', 'expert', 'vendor']}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['farmer']}><ReportsAnalytics /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>

      {/* Floating AI Assistant Chatbot with Disease Photo Scanner */}
      <AgriChatbot />
    </div>
  );
}

export default App;
