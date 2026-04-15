import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileUp, AlertTriangle, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentUploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const res = await fetch(`${apiUrl}/applications/my-applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const active = data.applications?.find(a => a.status === 'active');
        if (active) setSessionId(active.sessionId);
        else navigate('/dashboard');
      } catch (err) {
        toast.error('Session sync failed');
      }
    };
    fetchActiveSession();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const verifyDocument = async () => {
    if (!preview) return toast.error('Please select an ID document');

    setIsVerifying(true);
    const apiToast = toast.loading('AI Fraud Engine analyzing your document...');
    
    try {
      const response = await fetch(`${apiUrl}/verify-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: preview,
          mimeType: file.type
        })
      });

      const data = await response.json();
      
      if (data.success && data.verification_status === 'SUCCESS') {
        toast.success('Document OCR Complete!', { id: apiToast });
        setVerificationResult(data);
        localStorage.setItem('doc_verification', JSON.stringify(data));
        localStorage.setItem('id_image', preview);

        // PERSIST TO DB
        await fetch(`${apiUrl}/applications/${sessionId}/update`, {
           method: 'PATCH',
           headers: { 
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'application/json' 
           },
           body: JSON.stringify({ 
             currentStep: 'VIDEO_CALL',
             idDocumentImage: preview 
           })
        });

      } else if (data.verification_status === 'REPROCESS') {
        toast.error(`Low Quality: ${data.fraud_analysis?.reason || 'Please take a clearer photo.'}`, { id: apiToast, duration: 5000 });
        setVerificationResult(data);
      } else {
        toast.error(`Verification Failed: ${data.fraud_analysis?.reason || 'Potential security signal.'}`, { id: apiToast, duration: 5000 });
        setVerificationResult(data);
      }
    } catch (err) {
      toast.error('Network error during verification', { id: apiToast });
    } finally {
      setIsVerifying(false);
    }
  };

  const proceedToCall = () => {
    navigate(`/video-call/${sessionId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      
      <div className="text-center mb-12">
        <div className="inline-flex p-4 rounded-3xl bg-brand-primary/10 border border-brand-primary/20 mb-6">
          <ShieldCheck className="w-10 h-10 text-brand-primary" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter">Identity Proofing</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Before we begin the video call, our AI needs to verify your physical ID document (Aadhar, PAN, or Passport).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Upload Container */}
        <div className="space-y-6">
           <div 
             className={`relative group h-80 rounded-[40px] border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 bg-black/20 ${preview ? 'border-brand-primary' : 'border-white/10 hover:border-brand-primary/50'}`}
           >
             {preview ? (
               <div className="relative w-full h-full overflow-hidden rounded-3xl border border-white/10">
                 <img src={preview} alt="ID Preview" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => {setPreview(null); setFile(null);}} className="bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-bold">Change Image</button>
                 </div>
               </div>
             ) : (
               <>
                 <input 
                   type="file" 
                   accept="image/*" 
                   onChange={handleFileChange} 
                   className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                 />
                 <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                     <FileUp className="w-8 h-8 text-gray-500" />
                   </div>
                   <div>
                     <p className="text-white font-bold">Select ID Document</p>
                     <p className="text-xs text-gray-500 mt-1">PNG, JPG or PDF up to 10MB</p>
                   </div>
                 </div>
               </>
             )}
           </div>

           <button 
             onClick={verifyDocument}
             disabled={!preview || isVerifying || verificationResult?.verification_status === 'SUCCESS'}
             className="w-full py-5 rounded-[24px] bg-brand-primary text-white font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all disabled:opacity-50 shadow-2xl shadow-brand-primary/20 flex items-center justify-center space-x-3"
           >
             {isVerifying ? (
               <><Loader2 className="w-6 h-6 animate-spin" /> <span>Analyzing Document...</span></>
             ) : (
               <><span>Verify with AI</span></>
             )}
           </button>
        </div>

        {/* Status & Guidance */}
        <div className="space-y-6">
           <div className={`glass-panel p-8 rounded-[40px] border transition-all ${verificationResult?.verification_status === 'SUCCESS' ? 'border-green-500/50 bg-green-500/5' : 'border-white/5'}`}>
             <h3 className="text-xl font-bold text-white mb-6 flex items-center">
               <CheckCircle2 className={`w-6 h-6 mr-3 ${verificationResult?.verification_status === 'SUCCESS' ? 'text-green-400' : 'text-gray-600'}`} />
               Verification Result
             </h3>

             {!verificationResult ? (
               <div className="space-y-4">
                  <p className="text-sm text-gray-500 italic">No document analyzed yet. Please upload your ID to begin the automated fraud check.</p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <CreditCard className="w-5 h-5 text-gray-400 mb-2" />
                        <p className="text-[10px] text-gray-500 uppercase font-black">Supported</p>
                        <p className="text-xs text-white font-bold">Aadhar / PAN</p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <ShieldCheck className="w-5 h-5 text-gray-400 mb-2" />
                        <p className="text-[10px] text-gray-500 uppercase font-black">Security</p>
                        <p className="text-xs text-white font-bold">256-bit AES</p>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-xs text-gray-500 uppercase font-black">Status</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${verificationResult.verification_status === 'SUCCESS' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {verificationResult.verification_status}
                    </span>
                 </div>

                 {verificationResult.ocr_data && (
                   <div className="space-y-3">
                     <p className="text-[10px] text-gray-500 uppercase font-black">Extracted Metadata</p>
                     <div className="grid grid-cols-1 gap-2">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                           <span className="text-[10px] text-gray-500 block mb-1">Full Name</span>
                           <span className="text-sm text-white font-bold">{verificationResult.ocr_data.full_name}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                           <span className="text-[10px] text-gray-500 block mb-1">ID Number</span>
                           <span className="text-sm text-white font-mono">{verificationResult.ocr_data.id_number}</span>
                        </div>
                     </div>
                   </div>
                 )}

                 {verificationResult.fraud_analysis?.is_suspicious && (
                   <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/30 flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-red-400">Fraud Signal Detected</p>
                        <p className="text-xs text-red-500/70">{verificationResult.fraud_analysis.reason}</p>
                      </div>
                   </div>
                 )}
               </div>
             )}
           </div>

           {verificationResult?.verification_status === 'SUCCESS' && (
             <button 
               onClick={proceedToCall}
               className="w-full py-5 rounded-[40px] bg-brand-secondary text-brand-dark font-black uppercase tracking-widest hover:scale-[1.02] shadow-2xl shadow-brand-secondary/20 transition-all flex items-center justify-center space-x-3 animate-in zoom-in duration-500"
             >
               <span>Proceed to Video Call</span>
             </button>
           )}
        </div>
      </div>

    </div>
  );
}
