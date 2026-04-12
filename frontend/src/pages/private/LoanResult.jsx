import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Download, 
  Share2,
  AlertTriangle 
} from 'lucide-react';

export default function LoanResult() {
  const location = useLocation();
  const navigate = useNavigate();
  // We expect decision data to be passed through state
  const decision = location.state?.decision || { 
     eligible: true, 
     loan_amount: 5000, 
     interest_rate: 10.5, 
     reason: "Approved based on income and low risk flags." 
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in zoom-in duration-700">
      <div className={`glass-panel p-12 rounded-[60px] text-center border-2 ${decision.eligible ? 'border-green-500/30' : 'border-red-500/30'} relative overflow-hidden shadow-2xl`}>
        {/* Abstract background blobs */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full ${decision.eligible ? 'bg-green-500' : 'bg-red-500'}`}></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-10">
            {decision.eligible ? (
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center animate-bounce duration-1000">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            )}
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            {decision.eligible ? 'Congratulations!' : 'Application Update'}
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto">
            {decision.eligible 
              ? 'Your video verification was successful. You have been pre-approved for a loan offer.' 
              : 'Our AI engine has identified some risks that prevent us from offering a loan at this time.'}
          </p>

          {decision.eligible ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
               <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-2">Approved Amount</span>
                  <span className="text-4xl font-black text-white">₹{decision.loan_amount}</span>
               </div>
               <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-2">Interest Rate</span>
                  <span className="text-4xl font-black text-brand-secondary">{decision.interest_rate}%</span>
               </div>
            </div>
          ) : (
             <div className="bg-red-500/5 p-8 rounded-3xl border border-red-500/10 mb-12 flex items-center space-x-4 text-left">
                <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" />
                <div>
                   <h4 className="text-white font-bold mb-1">Reason for Rejection</h4>
                   <p className="text-gray-400 text-sm leading-relaxed">{decision.reason}</p>
                </div>
             </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {decision.eligible ? (
              <>
                <button className="w-full sm:w-auto bg-brand-primary hover:bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all hover:scale-105">
                  <Download className="w-5 h-5" />
                  <span>Download Agreement</span>
                </button>
                <button className="w-full sm:w-auto glass-panel hover:bg-white/10 text-white px-8 py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all">
                  <Share2 className="w-5 h-5" />
                  <span>Share Result</span>
                </button>
              </>
            ) : (
              <Link to="/support" className="bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold transition-all">
                Contact Support
              </Link>
            )}
            <Link to="/dashboard" className="w-full sm:w-auto text-gray-500 hover:text-white font-semibold flex items-center justify-center space-x-2 px-6">
               <span>Return to Dashboard</span>
               <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
