import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/audit-logs`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLogs(data.logs);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-brand-dark flex justify-center items-center text-white">Loading Logs...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center space-x-3 mb-8">
          <ShieldAlert className="w-8 h-8 text-brand-secondary" />
          <h1 className="text-3xl font-bold tracking-tight">Audit & Compliance Dashboard</h1>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 rounded-tl-2xl border-b border-white/5">Session ID</th>
                <th className="p-4 border-b border-white/5">Timestamp</th>
                <th className="p-4 border-b border-white/5">Age/Loc</th>
                <th className="p-4 border-b border-white/5">Extracted Income</th>
                <th className="p-4 border-b border-white/5">Risk Flags</th>
                <th className="p-4 border-b border-white/5">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map(log => (
                <tr key={log._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-300">{log.sessionId.substring(0, 8)}...</td>
                  <td className="p-4 text-sm text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-sm">{log.ageEstimate} yrs, {log.location}</td>
                  <td className="p-4 text-sm font-semibold">₹{log.extractedData?.income || 'N/A'}</td>
                  <td className="p-4 text-sm">
                    {log.extractedData?.risk_flags?.length > 0 ? (
                      <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">{log.extractedData.risk_flags.length} flags</span>
                    ) : (
                      <span className="text-gray-500 text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    {log.decision?.eligible ? (
                      <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Approved (₹{log.decision.loan_amount})</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-red-400">
                        <XCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Rejected</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
