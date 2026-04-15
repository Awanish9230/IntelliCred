import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="IntelliCred Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">IntelliCred</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Home</Link>
          <Link to="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">About Us</Link>
          <Link to="/how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How It Works</Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Dashboard</Link>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin" className="text-sm font-bold text-brand-secondary hover:text-white transition-colors flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Admin Panel
            </Link>
          )}
        </div>

        {/* Global Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-secondary/20 flex items-center justify-center border border-brand-secondary/30">
                  <UserIcon className="w-4 h-4 text-brand-secondary" />
                </div>
                <span className="text-sm font-medium text-white hidden sm:block">{user.name}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white px-4 py-2 transition-colors">Login</Link>
              <Link to="/signup" className="bg-brand-primary hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all duration-200">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
