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
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${apiUrl}/applications/my-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setApps(data.applications);
    } catch (err) {
      toast.error('Failed to sync applications');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const handleStartApplication = async () => {
    const apiToast = toast.loading('Initializing secure session...');
    try {
      const res = await fetch(`${apiUrl}/applications/initialize`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Session ready!', { id: apiToast });
        navigate(`/document-verification`);
      } else {
        toast.error(data.error || 'Initialization failed', { id: apiToast });
      }
    } catch (err) {
      toast.error('Network error', { id: apiToast });
    }
  };

  const handleCancelApplication = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) return;
    const apiToast = toast.loading('Cancelling...');
    try {
      const res = await fetch(`${apiUrl}/applications/${sessionId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Application cancelled', { id: apiToast });
        fetchApplications();
      }
    } catch (err) {
      toast.error('Failed to cancel', { id: apiToast });
    }
  };

  const handleContinue = (app) => {
    if (app.currentStep === 'DOCUMENT_UPLOAD') {
      navigate('/document-verification');
    } else {
      navigate(`/video-call/${app.sessionId}`);
    }
  };

  const activeApp = apps.find(a => a.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 italic">Hello, {user?.name}!</h1>
          <p className="text-gray-400 font-medium">Welcome back to your financial control center.</p>
        </div>
        <button 
          onClick={handleStartApplication}
          disabled={activeApp}
          className="bg-brand-primary hover:bg-indigo-600 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-brand-primary/20 flex items-center space-x-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-6 h-6" />
          <span>New Application</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Stats / Welcome Card */}
        <div className="lg:col-span-2 space-y-8">
          {activeApp ? (
            <div className="glass-panel p-8 rounded-[40px] relative overflow-hidden group border-brand-primary/20 bg-brand-primary/[0.03]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary opacity-10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:opacity-20 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 text-brand-secondary mb-4">
                  <Video className="w-5 h-5 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest">Ongoing Application</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">Continue where you left off</h2>
                <p className="text-gray-400 mb-8 max-w-lg leading-relaxed font-medium">
                  Your <span className="text-white font-bold">{activeApp.loanType}</span> is currently at the <span className="text-brand-primary font-black">[{activeApp.currentStep}]</span> stage. Complete it now for instant evaluation.
                </p>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleContinue(activeApp)}
                    className="flex items-center space-x-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-all"
                  >
                    <span>Continue Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleCancelApplication(activeApp.sessionId)}
                    className="text-gray-500 hover:text-red-500 font-bold transition-colors text-sm"
                  >
                    Cancel Application
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-[40px] border-white/5 bg-white/[0.02]">
               <h2 className="text-2xl font-black text-white mb-2 italic tracking-tighter uppercase opacity-40">No Active Applications</h2>
               <p className="text-gray-500 text-sm font-medium">Tap 'New Application' to get started with our AI-powered credit engine.</p>
            </div>
          )}

          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center">
              <History className="w-6 h-6 mr-3 text-brand-primary" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-12 text-gray-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : apps.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-gray-500 font-medium italic">Empty Activity Log</p>
                </div>
              ) : apps.map(app => (
                <div key={app._id} className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{app.loanType}</h4>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-right hidden sm:block">
                       <span className="text-[10px] text-gray-500 uppercase font-black uppercase tracking-tighter">Session</span>
                       <span className="font-mono text-[10px] text-brand-primary block">{app.sessionId}</span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border leading-none ${
                      app.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      app.status === 'active' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
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
