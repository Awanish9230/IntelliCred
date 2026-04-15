import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Users, 
  LayoutDashboard, 
  FileText, 
  Trash2,
  TrendingUp,
  UserCheck,
  Search,
  MessageSquare,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Transcript Modal State
  const [selectedSessionTranscripts, setSelectedSessionTranscripts] = useState(null);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [selectedIdImage, setSelectedIdImage] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  // ... (rest of states)

  // ... (inside filteredLogs.map)
  <button 
    onClick={() => { setSelectedIdImage(log.idDocumentImage); setShowIdModal(true); }}
    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-brand-secondary hover:bg-brand-secondary/10 transition-all"
    title="View ID Document"
  >
    <ShieldCheck className="w-5 h-5" />
  </button>

  // ... (At bottom of file)
  {/* ID DOCUMENT MODAL */}
  {showIdModal && (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-brand-dark/95 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
       <div className="w-full max-w-4xl glass-panel rounded-[48px] overflow-hidden flex flex-col shadow-2xl border border-white/5">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
             <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6 text-brand-secondary" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white italic tracking-tight">Identity Forensic Audit</h3>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Manual Review Queue • Reference Code ID-{selectedIdImage?.substring(10,18)}</p>
                </div>
             </div>
             <button onClick={() => setShowIdModal(false)} className="p-4 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <X className="w-8 h-8" />
             </button>
          </div>

          <div className="flex-1 bg-black p-8 flex items-center justify-center min-h-[400px]">
             {selectedIdImage ? (
               <div className="relative group">
                 <img 
                   src={selectedIdImage} 
                   alt="ID Document" 
                   className="max-h-[70vh] rounded-3xl shadow-2xl border-4 border-white/5 group-hover:border-brand-secondary/30 transition-all duration-700" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 rounded-3xl">
                    <p className="text-white font-bold text-lg mb-1 italic">Source Image Snapshot</p>
                    <p className="text-gray-400 text-xs text-brand-secondary font-black uppercase tracking-widest">Captured during live onboarding</p>
                 </div>
               </div>
             ) : (
               <div className="text-center p-20">
                  <ShieldAlert className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No Document Snapshot Saved for this Session.</p>
               </div>
             )}
          </div>

          <div className="p-8 bg-black/60 flex items-center justify-between border-t border-white/5">
             <div className="flex space-x-2">
                <button className="px-8 py-3 bg-brand-secondary text-brand-dark font-black rounded-2xl uppercase text-xs tracking-widest hover:scale-[1.05] transition-all">Approve ID</button>
                <button className="px-8 py-3 bg-red-500 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:scale-[1.05] transition-all">Flag For Fraud</button>
             </div>
             <p className="text-[10px] text-gray-600 font-medium">Compliance Seal: ACTIVE FOR SESSION</p>
          </div>
       </div>
    </div>
  )}
  const token = localStorage.getItem('token');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await fetch(`${apiUrl}/admin/stats`, { headers });
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } else if (activeTab === 'logs') {
        const res = await fetch(`${apiUrl}/audit-logs`, { headers });
        const data = await res.json();
        if (data.success) setLogs(data.logs);
      } else if (activeTab === 'users') {
        const res = await fetch(`${apiUrl}/admin/users`, { headers });
        const data = await res.json();
        if (data.success) setUsers(data.users);
      }
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      const res = await fetch(`${apiUrl}/admin/users/${id}/role`, { 
        method: 'PATCH', 
        headers,
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User promoted to ${newRole}`);
        setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      toast.error('Role update failed');
    }
  };

  const viewTranscript = async (sessionId) => {
    try {
      const res = await fetch(`${apiUrl}/admin/transcript/${sessionId}`, { headers });
      const data = await res.json();
      if (data.success) {
        setSelectedSessionTranscripts(data.transcripts);
        setShowTranscriptModal(true);
      }
    } catch (err) {
      toast.error('Could not load transcript');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/users/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) {
        toast.success('Account purged');
        setUsers(users.filter(u => u._id !== id));
      }
    } catch (err) {
      toast.error('Purge failed');
    }
  };

  const rejectLoan = async (id) => {
    if (!window.confirm('Are you sure you want to REJECT this previously approved loan? This action is forensic and final.')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/logs/${id}/decision`, { 
        method: 'PATCH', 
        headers,
        body: JSON.stringify({ eligible: false, status: 'rejected' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Loan rejected by Administrative Override');
        setLogs(logs.map(l => l._id === id ? { ...l, decision: { ...l.decision, eligible: false, status: 'rejected' } } : l));
      }
    } catch (err) {
      toast.error('Rejection failed');
    }
  };

  const approvePendingLoan = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/admin/logs/${id}/decision`, { 
        method: 'PATCH', 
        headers,
        body: JSON.stringify({ eligible: true, status: 'approved' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('High-value loan approved');
        setLogs(logs.map(l => l._id === id ? { ...l, decision: { ...l.decision, eligible: true, status: 'approved' } } : l));
      }
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const filteredLogs = logs.filter(l => 
    l.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.decision?.status || (l.decision?.eligible ? 'approved' : 'rejected')).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-dark p-6 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-brand-primary/10 border border-brand-primary/20">
              <ShieldAlert className="w-8 h-8 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">System Control Center</h1>
              <p className="text-gray-500 text-sm font-medium">Real-time intelligence and user administration.</p>
            </div>
          </div>

          <div className="flex p-1.5 glass-panel rounded-2xl border border-white/5">
            {[
              { id: 'overview', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Overview' },
              { id: 'logs', icon: <MessageSquare className="w-4 h-4" />, label: 'Transcripts' },
              { id: 'users', icon: <Users className="w-4 h-4" />, label: 'Directory' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-[1.02]' : 'text-gray-500 hover:text-white'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500 space-y-4">
             <div className="relative w-12 h-12">
               <div className="absolute inset-0 border-2 border-brand-primary/20 rounded-full"></div>
               <div className="absolute inset-0 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="font-bold tracking-widest text-xs uppercase">Syncing Live Cluster...</p>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Network Users', value: stats.totalUsers, icon: <Users />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Active WebApp', value: stats.activeConnections || 0, icon: <Activity />, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: 'Approval Rate', value: stats.approvalRate, icon: <TrendingUp />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                    { label: 'Cluster Value', value: stats.avgLoan, icon: <UserCheck />, color: 'text-brand-primary', bg: 'bg-brand-primary/10' }
                  ].map((stat, i) => (
                    <div key={i} className="glass-panel p-6 rounded-[32px] border border-white/5 group hover:bg-white/5 transition-all cursor-default">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                          {React.cloneElement(stat.icon, { className: 'w-5 h-5' })}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
                      <div className="text-3xl font-black text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-panel rounded-[40px] p-8 border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center">
                       <ShieldCheck className="w-5 h-5 mr-3 text-brand-primary" />
                       Risk Engine Distribution
                    </h3>
                    <div className="space-y-6">
                      {stats.riskDistribution?.length > 0 ? stats.riskDistribution.map((risk, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-sm">
                              <span className="text-gray-300 font-medium">{risk.name}</span>
                              <span className="text-white font-bold">{risk.count} Apps</span>
                           </div>
                           <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-primary rounded-full transition-all duration-1000" 
                                style={{ width: `${(risk.count / stats.totalApplications) * 100}%` }}
                              ></div>
                           </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-600 font-medium">No risk data aggregated yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="glass-panel rounded-[40px] p-8 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                     <h3 className="text-xl font-bold text-white mb-6">Service Uptime</h3>
                     <div className="flex items-center justify-center p-12">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                           <svg className="w-full h-full -rotate-90">
                              <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                              <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand-primary" strokeDasharray="376" strokeDashoffset="20" />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black text-white">99.9%</span>
                              <span className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">Healthy</span>
                           </div>
                        </div>
                     </div>
                     <p className="text-xs text-center text-gray-500 leading-relaxed font-medium">
                        Cluster node-01 is processing WebRTC streams with minimal latency.
                     </p>
                  </div>
                </div>
              </div>
            )}

            {/* APPLICATIONS / TRANSCRIPTS TAB */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                      <input 
                        type="text"
                        placeholder="Search Session ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-[20px] py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                 </div>

                 <div className="glass-panel rounded-[32px] overflow-hidden border border-white/5">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left min-w-[800px]">
                       <thead>
                         <tr className="bg-white/[0.02] text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] border-b border-white/5">
                           <th className="px-8 py-6">Session ID</th>
                           <th className="p-6">Timestamp</th>
                           <th className="p-6 text-center">Amount</th>
                           <th className="p-6 text-center">Bureau</th>
                           <th className="p-6">Status</th>
                           <th className="px-8 py-6 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {filteredLogs.map(log => (
                           <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-8 py-6">
                               <div className="flex items-center space-x-3">
                                  <div className={`w-2 h-2 rounded-full ${log.decision?.status === 'pending_admin' ? 'bg-orange-500 animate-pulse' : 'bg-brand-primary'}`}></div>
                                  <span className="font-mono text-xs text-gray-300">{log.sessionId.substring(log.sessionId.length - 12)}</span>
                               </div>
                             </td>
                             <td className="p-6 text-sm text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                             <td className="p-6 text-center">
                               <span className="text-sm font-black text-white italic">
                                 ₹{log.requestedAmount?.toLocaleString() || 'N/A'}
                               </span>
                             </td>
                             <td className="p-6 text-center">
                               <div className="flex flex-col items-center">
                                 <span className={`text-sm font-black ${log.bureauData?.credit_score > 700 ? 'text-green-400' : 'text-orange-400'}`}>
                                   {log.bureauData?.credit_score || '---'}
                                 </span>
                                 <span className="text-[8px] text-gray-500 uppercase font-black">Audit FICO</span>
                               </div>
                             </td>
                             <td className="p-6">
                               <div className={`flex items-center space-x-2 text-xs font-bold ${
                                 log.decision?.status === 'pending_admin' ? 'text-orange-400' : 
                                 log.decision?.eligible ? 'text-green-400' : 'text-red-400'
                               }`}>
                                  {log.decision?.status === 'pending_admin' ? <ShieldAlert className="w-4 h-4 animation-pulse" /> : 
                                   log.decision?.eligible ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                  <span>{log.decision?.status === 'pending_admin' ? 'Pending Admin' : log.decision?.eligible ? 'Approved' : 'Rejected'}</span>
                               </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end space-x-2">
                                 {log.decision?.status === 'pending_admin' && (
                                   <button 
                                     onClick={() => approvePendingLoan(log._id)}
                                     className="px-4 py-2 rounded-xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                   >
                                     Approve
                                   </button>
                                 )}
                                 <button 
                                   onClick={() => viewTranscript(log.sessionId)}
                                   className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-all border border-white/5"
                                   title="View Transcript"
                                 >
                                   <MessageSquare className="w-5 h-5" />
                                 </button>
                                 {log.decision?.eligible && log.decision?.status !== 'rejected' && (
                                   <button 
                                     onClick={() => rejectLoan(log._id)}
                                     className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                     title="Reject / Override"
                                   >
                                     <XCircle className="w-5 h-5" />
                                   </button>
                                 )}
                                 <button onClick={() => deleteUser(log._id)} className="p-3 rounded-xl bg-white/5 text-gray-700 hover:text-red-500 transition-all opacity-20 hover:opacity-100">
                                   <Trash2 className="w-5 h-5" />
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
               <div className="glass-panel rounded-[32px] overflow-hidden border border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                      <thead>
                        <tr className="bg-white/[0.02] text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] border-b border-white/5">
                           <th className="px-8 py-6">Identity</th>
                           <th className="p-6">Internal Email</th>
                           <th className="p-6">Privileges</th>
                           <th className="p-6">Member Since</th>
                           <th className="px-8 py-6 text-right">Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                           <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-8 py-6 flex items-center space-x-4">
                                 <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold shadow-inner border border-brand-primary/20">
                                   {u.name.charAt(0)}
                                 </div>
                                 <span className="font-bold text-white text-sm">{u.name}</span>
                              </td>
                              <td className="p-6 text-sm text-gray-400 font-medium">{u.email}</td>
                              <td className="p-6">
                                 <button 
                                   onClick={() => promoteUser(u._id, u.role)}
                                   className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/5 text-gray-500 border-white/5 hover:border-brand-primary/30 hover:text-brand-primary'}`}
                                 >
                                    {u.role}
                                 </button>
                              </td>
                              <td className="p-6 text-sm text-gray-600 font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="px-8 py-6 text-right">
                                 <button onClick={() => deleteUser(u._id)} className="p-3 rounded-xl bg-white/5 text-gray-600 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            )}

          </div>
        )}

      </div>

      {/* TRANSCRIPT MODAL */}
      {showTranscriptModal && selectedSessionTranscripts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-dark/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-3xl glass-panel rounded-[40px] flex flex-col max-h-[85vh] shadow-2xl border border-white/5">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                       <MessageSquare className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white leading-tight">Interaction Transcript</h3>
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Post-Processing Evidence Log</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setShowTranscriptModal(false)}
                  className="p-3 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {selectedSessionTranscripts.length > 0 ? selectedSessionTranscripts.map((t, i) => (
                  <div key={i} className={`flex flex-col ${t.speaker === 'Candidate' ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[85%] p-5 rounded-[24px] text-sm leading-relaxed ${t.speaker === 'Candidate' ? 'bg-white/5 text-gray-300 rounded-tl-none' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-tr-none'}`}>
                      <p className="mb-2 opacity-40 text-[10px] font-black uppercase tracking-widest">{t.speaker}</p>
                      {t.text}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 text-gray-600 font-bold tracking-widest text-xs uppercase">Initial synchronization missing transcripts.</div>
                )}
              </div>

              <div className="p-6 bg-black/20 text-center rounded-b-[40px]">
                 <p className="text-[10px] text-gray-500 font-medium">Internal Compliance Record • End-to-End Encrypted Access Only</p>
              </div>
           </div>
        </div>
      )}

      {/* ID DOCUMENT MODAL */}
      {showIdModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-brand-dark/95 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
           <div className="w-full max-w-4xl glass-panel rounded-[48px] overflow-hidden flex flex-col shadow-2xl border border-white/5">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center">
                       <ShieldCheck className="w-6 h-6 text-brand-secondary" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white italic tracking-tight">Identity Forensic Audit</h3>
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Manual Review Queue</p>
                    </div>
                 </div>
                 <button onClick={() => setShowIdModal(false)} className="p-4 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <X className="w-8 h-8" />
                 </button>
              </div>

              <div className="flex-1 bg-black p-8 flex items-center justify-center min-h-[400px]">
                 {selectedIdImage ? (
                   <div className="relative group">
                     <img 
                       src={selectedIdImage} 
                       alt="ID Document" 
                       className="max-h-[70vh] rounded-3xl shadow-2xl border-4 border-white/5 group-hover:border-brand-secondary/30 transition-all duration-700" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 rounded-3xl">
                        <p className="text-white font-bold text-lg mb-1 italic">Source Image Snapshot</p>
                        <p className="text-gray-400 text-xs text-brand-secondary font-black uppercase tracking-widest">Captured during live onboarding</p>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center p-20">
                      <ShieldAlert className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No Document Snapshot Saved for this Session.</p>
                   </div>
                 )}
              </div>

              <div className="p-8 bg-black/60 flex items-center justify-between border-t border-white/5">
                 <div className="flex space-x-2">
                    <button className="px-8 py-3 bg-brand-secondary text-brand-dark font-black rounded-2xl uppercase text-xs tracking-widest hover:scale-[1.05] transition-all">Approve ID</button>
                    <button className="px-8 py-3 bg-red-500 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:scale-[1.05] transition-all">Flag For Fraud</button>
                 </div>
                 <p className="text-[10px] text-gray-600 font-medium">Compliance Seal: ACTIVE FOR SESSION</p>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
