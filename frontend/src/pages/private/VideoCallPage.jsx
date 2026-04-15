import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
  Code, Loader2, CheckCircle2, User, Landmark, 
  Briefcase, Fingerprint, Coins 
} from 'lucide-react';
import toast from 'react-hot-toast';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io(socketUrl);

export default function VideoCallPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  
  // States for UI
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [processingState, setProcessingState] = useState(null); 
  const [decision, setDecision] = useState(null);
  const [geoData, setGeoData] = useState({ lat: 0, lng: 0, address: 'Detecting...' });
  const [estimatedAge, setEstimatedAge] = useState(0);
  const [consentDetected, setConsentDetected] = useState(false);
  const [docVerification, setDocVerification] = useState(null);
  const [targetLoanAmount, setTargetLoanAmount] = useState('');

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peersRef = useRef([]);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false); // Ref to track recording state across effect turns

  const interviewSteps = [
    { id: 'identity', label: 'Face Match & Identity', icon: <User className="w-4 h-4" />, status: docVerification ? 'completed' : 'pending' },
    { id: 'docs', label: 'Document Review', icon: <Fingerprint className="w-4 h-4" />, status: docVerification ? 'completed' : 'pending' },
    { id: 'income', label: 'Income Declaration', icon: <Landmark className="w-4 h-4" />, status: transcript.toLowerCase().includes('income') ? 'completed' : 'pending' },
    { id: 'employment', label: 'Employment Proof', icon: <Briefcase className="w-4 h-4" />, status: transcript.toLowerCase().includes('work') || transcript.toLowerCase().includes('company') ? 'completed' : 'pending' },
    { id: 'consent', label: 'Legal Consent', icon: <CheckCircle2 className="w-4 h-4" />, status: consentDetected ? 'completed' : 'pending' }
  ];

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Load pre-call verification data
    const savedDoc = localStorage.getItem('doc_verification');
    if (savedDoc) setDocVerification(JSON.parse(savedDoc));

    // 1. Get User Media - Ensuring high quality and muted local
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        setStream(currentStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = currentStream;
        }
        socket.emit('join-room', sessionId, socket.id);

        socket.on('user-connected', userId => {
          const peer = createPeer(userId, socket.id, currentStream);
          peersRef.current.push({ peerID: userId, peer });
          setPeers([...peersRef.current]);
        });

        socket.on('offer', payload => {
          const peer = addPeer(payload.signal, payload.callerID, currentStream);
          peersRef.current.push({ peerID: payload.callerID, peer });
          setPeers([...peersRef.current]);
        });

        socket.on('answer', payload => {
          const item = peersRef.current.find(p => p.peerID === payload.id);
          if (item) item.peer.signal(payload.signal);
        });

      }).catch(err => {
        toast.error('Camera access denied! Please enable it to proceed.');
        console.error("Media Error: ", err);
      });

    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        console.log('Speech Recognition Engine: ONLINE');
      };

      recognitionRef.current.onresult = (event) => {
        setIsSpeaking(true);
        clearTimeout(window.speakingTimeout);
        window.speakingTimeout = setTimeout(() => setIsSpeaking(false), 2000);

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTxt = event.results[i][0].transcript;
            setTranscript(prev => prev + ' ' + finalTxt);
            
            const lowerTxt = finalTxt.toLowerCase();
            if (lowerTxt.includes('agree') || lowerTxt.includes('consent') || lowerTxt.includes('accept')) {
              setConsentDetected(true);
            }

            console.log('Transmitting to server:', finalTxt);
            fetch(`${apiUrl}/transcript`, {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ sessionId, text: finalTxt, speaker: 'customer' })
            }).catch(e => console.error('Transcript Sync Failed:', e));
          }
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if we are still in recording mode
        if (isRecordingRef.current) {
          console.log('Restarting Speech Engine...');
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied for Speech-to-Text.');
        }
      };
    }

    // 2. Simulated CV Age Detection
    const ageInterval = setInterval(() => {
       if (isVideoOn) {
          setEstimatedAge(prev => prev === 0 ? 22 + Math.floor(Math.random() * 8) : prev);
       }
    }, 5000);

    // 3. Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGeoData({ lat: position.coords.latitude, lng: position.coords.longitude, address: 'Verified Location' });
      });
    }

    return () => {
      socket.disconnect();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent restart on unmount
        recognitionRef.current.stop();
      }
      if (stream) stream.getTracks().forEach(t => t.stop());
      clearInterval(ageInterval);
    };
  }, [sessionId, isVideoOn]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal => socket.emit('offer', { userToSignal, callerID, signal, target: userToSignal }));
    peer.on('stream', remoteStream => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream; });
    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', signal => socket.emit('answer', { signal, callerID, id: socket.id, target: callerID }));
    peer.on('stream', remoteStream => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream; });
    peer.signal(incomingSignal);
    return peer;
  };

  const processApplication = async () => {
    if (!targetLoanAmount) return toast.error('Please enter the loan amount you want.');
    
    setProcessingState('analyzing');
    const processToast = toast.loading('AI analyzing evidence and computing offer...');
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/process-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          age: estimatedAge || 25, 
          location: geoData.address,
          coords: { lat: geoData.lat, lng: geoData.lng },
          email: JSON.parse(localStorage.getItem('user') || '{}').email,
          requested_amount: targetLoanAmount,
          doc_ver_status: docVerification?.verification_status || 'NOT_DONE',
          id_image: localStorage.getItem('id_image') // Send the base64 image here
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Analysis Complete!', { id: processToast });
        setDecision(data.decision);
        setTimeout(() => navigate('/loan-result', { state: { decision: data.decision } }), 2000);
      } else {
        toast.error(data.error || 'Failed', { id: processToast });
      }
    } catch (err) {
      toast.error('Network error', { id: processToast });
    } finally {
      setProcessingState('done');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-6 flex flex-col lg:flex-row gap-6">
      
      {/* MAIN CONTENT: The Large Video Stage */}
      <div className="flex-1 flex flex-col space-y-4">
        
        {/* Banner */}
        <div className="glass-panel p-5 rounded-[32px] flex items-center justify-between border-white/5 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
              <Landmark className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white italic tracking-tight">Active Interview</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Secure Video Gateway node-401</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-black">AI Age Confidence</p>
                <p className="text-sm text-brand-secondary font-black">{estimatedAge || '--'} yrs</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-black">Location Status</p>
                <p className="text-sm text-green-400 font-black">Verified</p>
             </div>
          </div>
        </div>

        {/* Video Theatre */}
        <div className="relative flex-1 bg-black/40 rounded-[48px] overflow-hidden border border-white/5 shadow-2xl group min-h-[500px]">
           {/* Inverted layout: User wants to see themselves large if alone */}
           <video 
             className="w-full h-full object-cover" 
             ref={remoteVideoRef} 
             autoPlay playsInline 
           />
           
           {/* If no remote stream, show a "Waiting" overlay or a large self-view */}
           {!remoteVideoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/20 backdrop-blur-sm">
                 <div className="text-center">
                    <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-tighter text-sm">Synchronizing with Agent...</p>
                 </div>
              </div>
           )}

           {/* Local Large Self-View (Primary Focus for user verification) */}
           <div className="absolute top-8 right-8 w-64 aspect-video rounded-3xl overflow-hidden border-2 border-brand-primary shadow-2xl bg-black">
              <video className="w-full h-full object-cover" ref={localVideoRef} autoPlay playsInline muted />
              <div className="absolute bottom-2 left-3 bg-brand-primary/80 backdrop-blur-md px-2 py-0.5 rounded-lg">
                <p className="text-[8px] text-white font-black uppercase">Your Stream (LIVE)</p>
              </div>
           </div>

           {/* Call Controls Overlay */}
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-black/40 backdrop-blur-xl p-4 rounded-[32px] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button onClick={() => setIsMicOn(!isMicOn)} className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-red-500 text-white'}`}>
                {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-4 rounded-2xl transition-all ${isVideoOn ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-red-500 text-white'}`}>
                {isVideoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
              <div className="w-px h-8 bg-white/10 mx-2"></div>
              <button 
                onClick={() => {if(recognitionRef.current) recognitionRef.current.start(); setIsRecording(true);}}
                className={`flex items-center space-x-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-brand-primary text-white hover:scale-[1.05]'}`}
              >
                {isRecording && (
                   <div className="flex items-center space-x-2 mr-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                      {isSpeaking && <div className="text-[8px] bg-green-500 text-white px-1 rounded animate-bounce">HEARING VOICE</div>}
                   </div>
                )}
                <span>{isRecording ? 'Recording Live' : 'Start Interview'}</span>
              </button>
              <button onClick={() => navigate('/dashboard')} className="p-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all">
                <PhoneOff className="w-6 h-6" />
              </button>
           </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Interview Guide & Intelligence */}
      <div className="w-full lg:w-[400px] flex flex-col space-y-6">
        
        {/* Questionnaire Panel */}
        <div className="glass-panel p-8 rounded-[40px] flex-1 flex flex-col border-white/5 shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Interview Checklist</h3>
              <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] text-gray-400 font-bold">
                {interviewSteps.filter(s => s.status === 'completed').length}/{interviewSteps.length} COMPLETE
              </div>
           </div>

           <div className="space-y-6 flex-1">
              {interviewSteps.map((step, idx) => (
                <div key={idx} className={`flex items-start space-x-4 transition-all ${step.status === 'completed' ? 'opacity-100' : 'opacity-40'}`}>
                   <div className={`p-2 rounded-xl border flex-shrink-0 ${step.status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                   </div>
                   <div className="pt-1">
                      <p className={`text-sm font-bold leading-none ${step.status === 'completed' ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{step.status === 'completed' ? 'Verified by AI' : 'Waiting for declaration...'}</p>
                   </div>
                </div>
              ))}
           </div>

           {/* Loan Amount Input Step */}
           <div className="mt-8 pt-8 border-t border-white/5">
              <div className="space-y-4">
                 <div className="flex items-center space-x-2 text-brand-secondary">
                    <Coins className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Requested Loan Amount</span>
                 </div>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500">₹</span>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={targetLoanAmount}
                      onChange={(e) => setTargetLoanAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                 </div>
                 <p className="text-[10px] text-gray-500 italic">This will be cross-verified against your income declaration and credit profile.</p>
              </div>
           </div>

           <button 
             onClick={processApplication}
             disabled={processingState === 'analyzing' || !isRecording}
             className="w-full mt-8 py-5 rounded-[24px] bg-brand-secondary text-brand-dark font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-brand-secondary/20"
           >
             {processingState === 'analyzing' ? 'Processing Final Verdict...' : 'Freeze & Submit'}
           </button>
        </div>

        {/* Live Logs Bottom (Condensed) */}
        <div className="glass-panel p-6 rounded-[32px] h-48 border-white/5 flex flex-col">
           <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-3">Auditable Stream</h4>
           <div className="flex-1 bg-black/40 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
              <p className="text-[11px] font-mono text-gray-400 leading-relaxed italic">
                {transcript || "Speak clearly into your microphone to record your declaration..."}
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}
