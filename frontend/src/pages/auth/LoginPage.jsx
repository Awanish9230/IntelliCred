import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import TurnstileWidget from '../../components/common/TurnstileWidget';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUnverified(false);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, turnstileToken })
      });
      const data = await response.json();
      if (data.success) {
        login(data.user, data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(data.error || 'Invalid credentials');
        if (data.isVerified === false) {
          setUnverified(true);
        }
      }
    } catch (err) {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        toast.error(data.error || 'Failed to resend email');
      }
    } catch (err) {
      toast.error('Connection failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to manage your loan applications</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-white"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1 pr-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-secondary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <TurnstileWidget onVerify={setTurnstileToken} />

            <button 
              type="submit" 
              disabled={loading || !turnstileToken}
              className="w-full bg-brand-primary hover:bg-indigo-600 font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              <span>{loading ? 'Authenticating...' : 'Sign In Now'}</span>
            </button>
          </form>

          {unverified && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-center">
              <p className="text-red-400 text-sm mb-3">Your email is not verified.</p>
              <button 
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-sm text-gray-500">
              Don't have an account? <Link to="/signup" className="text-brand-secondary font-semibold hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
