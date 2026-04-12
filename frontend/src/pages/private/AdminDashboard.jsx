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
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;
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

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/users/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) {
        toast.success('User removed');
        setUsers(users.filter(u => u._id !== id));
      }
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm('Delete this audit record?')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/logs/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) {
        toast.success('Log removed');
        setLogs(logs.filter(l => l._id !== id));
      }
    } catch (err) {
      toast.error('Failed to remove log');
    }
  };

  const filteredLogs = logs.filter(l => 
    l.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.decision?.eligible ? 'approved' : 'rejected').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-dark p-6 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-secondary/20 flex items-center justify-center border border-brand-secondary/30">
              <ShieldAlert className="w-7 h-7 text-brand-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">System Control Panel</h1>
              <p className="text-gray-400 text-sm">Managing IntelliCred core operations and compliance.</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1.5 glass-panel rounded-2xl self-start md:self-center">
            {[
              { id: 'overview', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Overview' },
              { id: 'logs', icon: <FileText className="w-4 h-4" />, label: 'Applications' },
              { id: 'users', icon: <Users className="w-4 h-4" />, label: 'Users' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mr-3"></div>
             Synchronizing Cloud Data...
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: <Users className="text-blue-400" />, trend: '+4% this week' },
                  { label: 'Total Apps', value: stats.totalApplications, icon: <FileText className="text-brand-secondary" />, trend: '+12% growth' },
                  { label: 'Approval Rate', value: stats.approvalRate, icon: <TrendingUp className="text-green-400" />, trend: 'Healthy threshold' },
                  { label: 'Avg Loan', value: stats.avgLoan, icon: <UserCheck className="text-indigo-400" />, trend: 'Market average' }
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-6 rounded-3xl border border-white/5 group hover:border-brand-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {stat.icon}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                    <div className="text-[10px] text-gray-600 font-semibold">{stat.trend}</div>
                  </div>
                ))}
              </div>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                 <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="text"
                      placeholder="Search Session ID or Status..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/30 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                    />
                 </div>
                 <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-black/40 text-gray-500 text-xs font-bold uppercase tracking-[0.2em] border-b border-white/5">
                         <th className="p-5">Session</th>
                         <th className="p-5">Date</th>
                         <th className="p-5 text-center">Risk</th>
                         <th className="p-5">Decision</th>
                         <th className="p-5 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                       {filteredLogs.map(log => (
                         <tr key={log._id} className="hover:bg-white/5 transition-colors">
                           <td className="p-5 font-mono text-xs text-gray-400">{log.sessionId}</td>
                           <td className="p-5 text-sm">{new Date(log.createdAt).toLocaleDateString()}</td>
                           <td className="p-5 text-center">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.extractedData?.risk_flags?.length > 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500'}`}>
                               {log.extractedData?.risk_flags?.length || 0} Flags
                             </span>
                           </td>
                           <td className="p-5">
                             <div className={`flex items-center space-x-2 text-sm font-bold ${log.decision?.eligible ? 'text-green-400' : 'text-red-400'}`}>
                                {log.decision?.eligible ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                <span>{log.decision?.eligible ? 'Approved' : 'Rejected'}</span>
                             </div>
                           </td>
                           <td className="p-5 text-right">
                             <button onClick={() => deleteLog(log._id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
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

            {/* USERS TAB */}
            {activeTab === 'users' && (
               <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-black/40 text-gray-500 text-xs font-bold uppercase tracking-[0.2em] border-b border-white/5">
                           <th className="p-5">User Account</th>
                           <th className="p-5">Email</th>
                           <th className="p-5">Role</th>
                           <th className="p-5">Joined</th>
                           <th className="p-5 text-right">Settings</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                           <tr key={u._id} className="hover:bg-white/5 transition-colors">
                              <td className="p-5 flex items-center space-x-3">
                                 <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                                   <Users className="w-4 h-4" />
                                 </div>
                                 <span className="font-bold text-white">{u.name}</span>
                              </td>
                              <td className="p-5 text-sm text-gray-400">{u.email}</td>
                              <td className="p-5">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-gray-800 text-gray-400'}`}>
                                    {u.role}
                                 </span>
                              </td>
                              <td className="p-5 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="p-5 text-right">
                                 <button onClick={() => deleteUser(u._id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
