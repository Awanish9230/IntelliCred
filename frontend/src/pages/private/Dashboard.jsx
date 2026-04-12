import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  History, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  Video
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([
    { id: '1', date: 'Oct 12, 2026', type: 'Personal Loan', status: 'In Progress', amount: '₹5,000' },
    { id: '2', date: 'Oct 05, 2026', type: 'Quick Credit', status: 'Approved', amount: '₹1,200' },
  ]);

  const handleStartApplication = () => {
    toast.loading('Initializing secure video session...', { id: 'session' });
    setTimeout(() => {
      const mockSessionId = Math.random().toString(36).substring(7);
      toast.success('Session ready!', { id: 'session' });
      navigate(`/video-call/${mockSessionId}`);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header / Welcome Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Hello, {user?.name}!</h1>
          <p className="text-gray-400">Welcome back to your financial control center.</p>
        </div>
        <button 
          onClick={handleStartApplication}
          className="bg-brand-primary hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-brand-primary/20 flex items-center space-x-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-6 h-6" />
          <span>New Application</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Stats / Welcome Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary opacity-5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:opacity-10 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 text-brand-secondary mb-4">
                <Video className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Ready for Video KYC</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Complete your verification</h2>
              <p className="text-gray-400 mb-8 max-w-lg leading-relaxed">
                Your personal loan application for <span className="text-white font-semibold">₹5,000</span> is waiting for a 2-minute video verification. Start it now to get instant approval.
              </p>
              <button 
                 onClick={handleStartApplication}
                 className="flex items-center space-x-2 text-white font-semibold group-hover:text-brand-secondary transition-colors"
                >
                <span>Continue Application</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <History className="w-6 h-6 mr-3 text-gray-500" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {apps.map(app => (
                <div key={app.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{app.type}</h4>
                      <p className="text-sm text-gray-500">{app.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-right hidden sm:block">
                       <span className="text-sm text-gray-500 block">Amount</span>
                       <span className="font-bold text-white">{app.amount}</span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                      app.status === 'Approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {app.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-3xl">
             <h4 className="font-bold text-white mb-6">Application Progress</h4>
             <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">Basic Info</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white text-sm font-semibold">Video Verification</span>
                </div>
                <div className="flex items-center space-x-4 opacity-40">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  </div>
                  <span className="text-sm text-gray-500">Risk Assessment</span>
                </div>
             </div>
          </div>

          <div className="bg-gradient-to-br from-brand-primary to-indigo-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
            <h4 className="text-white font-bold text-xl mb-4">Did you know?</h4>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              Verified accounts get 2% lower interest rates on their first loan. Start your call now!
            </p>
            <button className="bg-white text-brand-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-shadow">
               Learn More
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
