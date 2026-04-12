import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, History, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Your Profile</h1>
        <p className="text-gray-400">Manage your account and application history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* User Stats/Info */}
        <div className="md:col-span-1 space-y-6">
           <div className="glass-panel p-8 rounded-[40px] text-center">
              <div className="w-24 h-24 rounded-full bg-brand-primary/20 mx-auto flex items-center justify-center border-2 border-brand-primary mb-6">
                <User className="w-10 h-10 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{user?.name}</h3>
              <p className="text-gray-500 text-sm mb-6 uppercase tracking-widest">{user?.role}</p>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-3 rounded-2xl transition-all border border-red-500/20"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-bold">Logout</span>
              </button>
           </div>
        </div>

        {/* Detailed Info */}
        <div className="md:col-span-2 space-y-6">
           <div className="glass-panel p-8 rounded-[40px] space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <div className="flex items-center space-x-4">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">Email Address</p>
                      <p className="text-white font-medium">{user?.email}</p>
                    </div>
                 </div>
                 <button className="text-xs font-bold text-brand-secondary hover:underline">Edit</button>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <div className="flex items-center space-x-4">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">Security Status</p>
                      <p className="text-green-400 font-medium">Verified Account</p>
                    </div>
                 </div>
              </div>

              <div>
                <h4 className="flex items-center text-white font-bold mb-4">
                  <History className="w-5 h-5 mr-3 text-gray-500" />
                  Loan History
                </h4>
                <div className="space-y-3">
                   <div className="bg-black/20 p-4 rounded-2xl flex items-center justify-between">
                      <div className="text-sm">
                        <p className="text-white font-semibold">Personal Loan #91A8</p>
                        <p className="text-gray-500">Oct 05, 2026</p>
                      </div>
                      <span className="text-brand-secondary font-bold">$1,200</span>
                   </div>
                </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
