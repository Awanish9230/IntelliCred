import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ToastProvider from './components/ui/ToastProvider';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import HowItWorks from './pages/public/HowItWorks';
import Contact from './pages/public/Contact';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Dashboard from './pages/private/Dashboard';
import VideoCallPage from './pages/private/VideoCallPage';
import Profile from './pages/private/Profile';
import AdminDashboard from './pages/private/AdminDashboard';
import LoanResult from './pages/private/LoanResult';
import DocumentUploadPage from './pages/private/DocumentUploadPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

// Admin Only Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

import { useLocation } from 'react-router-dom';

function AppRoutes() {
  const location = useLocation();
  const isVideoCall = location.pathname.includes('/video-call/');

  return (
    <div className="flex flex-col min-h-screen">
      {!isVideoCall && <Navbar />}
      <div className={`${!isVideoCall ? 'pt-24' : ''} flex-1`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify/:token" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          {/* Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/video-call/:sessionId" element={<PrivateRoute><VideoCallPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/loan-result" element={<PrivateRoute><LoanResult /></PrivateRoute>} />
          <Route path="/document-verification" element={<PrivateRoute><DocumentUploadPage /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </div>
      {!isVideoCall && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastProvider />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
