import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  History, 
  LogOut, 
  Calendar, 
  CreditCard, 
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMyLoans = async () => {
      try {
        const res = await fetch(`${apiUrl}/applications/my-applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          // Filter for completed applications which have a decision
          setApps(data.applications.filter(a => a.status === 'completed' && a.decision));
        }
      } catch (err) {
        toast.error('Failed to load loan history');
      } finally {
        setLoading(false);
      }
    };
    fetchMyLoans();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const calculateEMI = (principal, annualRate, months) => {
    if (!principal || !annualRate || !months) return 0;
    const r = (annualRate / 12) / 100;
    const n = months;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const getDueDate = (submittedAt) => {
    const date = new Date(submittedAt);
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">MY IDENTITY</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Verified Forensic Profile • Node Alpha</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-4 rounded-[24px] transition-all font-black uppercase text-xs tracking-widest border border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span>Terminate Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Profile Sidebar */}
        <div className="space-y-8">
           <div className="glass-panel p-10 rounded-[48px] text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl rounded-full"></div>
              <div className="w-28 h-28 rounded-[36px] bg-brand-primary/10 mx-auto flex items-center justify-center border-2 border-brand-primary/30 mb-8 relative">
                 <User className="w-12 h-12 text-brand-primary" />
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-brand-dark flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                 </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-2 italic uppercase tracking-tighter">{user?.name}</h3>
              <p className="text-brand-secondary text-[10px] mb-8 font-black uppercase tracking-[0.3em] font-mono">ID_{user?.id?.substring(0,8)}</p>
              
              <div className="space-y-4 text-left">
                 <div className="bg-white/5 p-4 rounded-3xl flex items-center space-x-4 border border-white/5">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div className="overflow-hidden">
                       <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Digital Mail</p>
                       <p className="text-white text-sm font-bold truncate">{user?.email}</p>
                    </div>
                 </div>
                 <div className="bg-white/5 p-4 rounded-3xl flex items-center space-x-4 border border-white/5">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                       <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Forensic Status</p>
                       <p className="text-green-400 text-sm font-bold">BIOMETRIC_VERIFIED</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-brand-primary to-indigo-900 p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                 <h4 className="text-white font-black italic text-xl mb-4">Forensic Health</h4>
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Trust Multiplier</span>
                    <span className="text-white font-black">1.2x</span>
                 </div>
                 <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-secondary h-full animate-progress" style={{ width: '85%' }}></div>
                 </div>
                 <p className="text-indigo-100/60 text-[10px] mt-6 leading-relaxed font-bold uppercase tracking-widest">Identity scoring optimized via real-time micro-expression analysis.</p>
              </div>
           </div>
        </div>

        {/* Loan History & Financials */}
        <div className="lg:col-span-2 space-y-10">
           
           <div className="glass-panel p-10 rounded-[48px]">
              <div className="flex items-center justify-between mb-10">
                <h4 className="flex items-center text-2xl font-black text-white italic tracking-tighter uppercase">
                  <History className="w-8 h-8 mr-4 text-brand-primary" />
                  Active Loan Ledger
                </h4>
                <div className="flex space-x-2">
                   <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Live Sync</span>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                   <Clock className="w-10 h-10 text-brand-primary animate-spin" />
                </div>
              ) : apps.length === 0 ? (
                <div className="text-center py-24 bg-white/5 rounded-[40px] border-2 border-dashed border-white/5">
                   <AlertCircle className="w-12 h-12 text-gray-700 mx-auto mb-6" />
                   <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No Active Forensic Loans Found</p>
                   <p className="text-[10px] text-gray-600 font-medium mt-2">Initialize a new session from the dashboard to secure funding.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {apps.map((app) => {
                    const isApproved = app.decision?.status === 'approved';
                    const principal = app.decision?.loan_amount || 0;
                    const rate = app.decision?.interest_rate || 14.5;
                    const tenure = (app.decision?.tenure && app.decision?.tenure[0]) || 12;
                    const emi = calculateEMI(principal, rate, tenure);

                    return (
                      <div key={app._id} className={`group relative p-8 rounded-[40px] transition-all border-2 ${isApproved ? 'bg-green-500/[0.03] border-green-500/10 hover:border-green-500/30' : 'bg-red-500/[0.03] border-red-500/10 hover:border-red-500/30'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                           <div className="flex items-start space-x-6">
                              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center border-2 ${isApproved ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                 {isApproved ? <CheckCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                              </div>
                              <div>
                                 <h5 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{app.loanType || 'Personal Forensic Loan'}</h5>
                                 <div className="flex items-center space-x-3">
                                   <p className="text-2xl font-black text-white italic tracking-tighter">₹{principal.toLocaleString()}</p>
                                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isApproved ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                      {isApproved ? 'Disbursed' : 'Rejected'}
                                   </span>
                                 </div>
                                 <p className="text-[10px] text-gray-500 font-mono mt-2">SESSION_REF: {app.sessionId}</p>
                              </div>
                           </div>

                           {isApproved && (
                              <div className="flex flex-col items-end">
                                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Automated EMI</p>
                                 <p className="text-3xl font-black text-brand-secondary italic tracking-tighter">₹{emi.toLocaleString()}<span className="text-sm font-bold text-gray-500 not-italic">/mo</span></p>
                              </div>
                           )}
                        </div>

                        {isApproved && (
                          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                             <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 flex items-center">
                                   <Calendar className="w-3 h-3 mr-1" /> Next Due
                                </p>
                                <p className="text-xs font-bold text-white">{getDueDate(app.submittedAt)}</p>
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 flex items-center">
                                   <CreditCard className="w-3 h-3 mr-1" /> Tenure
                                </p>
                                <p className="text-xs font-bold text-white uppercase">{tenure} Months</p>
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 flex items-center">
                                   <ArrowUpRight className="w-3 h-3 mr-1" /> Rate
                                </p>
                                <p className="text-xs font-bold text-brand-secondary">{rate}% p.a</p>
                             </div>
                             <div className="flex justify-end items-end">
                                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Pay Now</button>
                             </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
           </div>

           {/* Legal Footer for Account */}
           <div className="px-10 py-6 glass-panel rounded-[32px] border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-gray-600">
                 <Shield className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted Identity Shield</span>
              </div>
              <span className="text-[10px] text-gray-700 font-bold uppercase">Compliance Node: #778-F</span>
           </div>

        </div>

      </div>
    </div>
  );
}
