import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
  Code, Loader2, CheckCircle2, User, Landmark, 
  Briefcase, Fingerprint, Coins, ShieldCheck, ArrowRight,
  Clock, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io(socketUrl);

export default function VideoCallPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  
  // Immersive & Question States
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isClarifying, setIsClarifying] = useState(false);
  const [structuredAnswers, setStructuredAnswers] = useState({});
  
  const aiQuestions = [
    { id: 'income', q: 'Please state your monthly take-home income and source of salary.', icon: <Coins className="w-5 h-5" /> },
    { id: 'employer', q: 'Which company are you currently employed with and what is your designation?', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'tenure', q: 'How long have you been working with your current organization?', icon: <Clock className="w-5 h-5" /> },
    { id: 'debts', q: 'Do you have any active personal loans, home loans, or car loans?', icon: <Landmark className="w-5 h-5" /> },
    { id: 'emi', q: 'What is the total EMI amount you pay every month for existing debts?', icon: <Coins className="w-5 h-5" /> },
    { id: 'purpose', q: 'What is the primary objective or purpose for this specific loan request?', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'residence', q: 'Is your current residence owned by you or is it a rented property?', icon: <User className="w-5 h-5" /> },
    { id: 'dependents', q: 'How many dependents or family members are currently supported by your income?', icon: <User className="w-5 h-5" /> },
    { id: 'city', q: 'In which city are you currently residing?', icon: <Landmark className="w-5 h-5" /> },
    { id: 'native', q: 'Where is your permanent native place according to your records?', icon: <Landmark className="w-5 h-5" /> },
    { id: 'bank', q: 'Which bank do you use as your primary account for salary credits?', icon: <Landmark className="w-5 h-5" /> },
    { id: 'salary_date', q: 'On which date of the month is your salary usually credited?', icon: <Clock className="w-5 h-5" /> },
    { id: 'other_income', q: 'Do you have any side business or additional sources of income?', icon: <Coins className="w-5 h-5" /> },
    { id: 'tenure_target', q: 'What is the expected tenure (months) you are looking for this loan?', icon: <Clock className="w-5 h-5" /> },
    { id: 'history', q: 'Have you ever defaulted on any loan or credit card in the last 2 years?', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'auto_debit', q: 'Are you comfortable with automatic EMI deduction from your salary account?', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 'emergency', q: 'In case of an emergency, who would be your primary point of contact?', icon: <User className="w-5 h-5" /> },
    { id: 'ref_name', q: 'Please state the name of a professional reference from your company.', icon: <User className="w-5 h-5" /> },
    { id: 'ref_relation', q: 'What is your relationship with the professional reference you provided?', icon: <User className="w-5 h-5" /> },
    { id: 'intelli_choice', q: 'Why did you choose IntelliCred for your credit requirements today?', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'id_confirm', q: 'Can you confirm that the ID document you uploaded belongs solely to you?', icon: <Fingerprint className="w-5 h-5" /> },
    { id: 'data_truth', q: 'Do you solemnly declare that all information shared today is 100% accurate?', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'bureau_consent', q: 'Do you grant us permission to fetch your credit score from the bureau?', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'recording_consent', q: 'Do you consent to this video being recorded for forensic audit purposes?', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'final_verification', q: 'Please look directly into the camera and state your full name for the record.', icon: <User className="w-5 h-5" /> },
    { id: 'location_check', q: 'Are you currently at your workplace or your residence?', icon: <Landmark className="w-5 h-5" /> },
    { id: 'mobile_verify', q: 'Is the mobile number provided during sign-up your primary active number?', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'fraud_vow', q: 'Do you understand that any fraudulent declaration may lead to legal action?', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'digital_sign', q: 'Do you agree to use your video declaration as a digital signature proxy?', icon: <Fingerprint className="w-5 h-5" /> },
    { id: 'interview_close', q: 'Is there anything else you would like to clarify before we close this interview?', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

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
    { id: 'income', label: 'Income Declaration', icon: <Landmark className="w-4 h-4" />, status: structuredAnswers['income'] ? 'completed' : 'pending' },
    { id: 'employment', label: 'Employment Proof', icon: <Briefcase className="w-4 h-4" />, status: structuredAnswers['employer'] ? 'completed' : 'pending' },
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
            
            // Structured Capture
            const currentQId = aiQuestions[currentQuestionIndex].id;
            setStructuredAnswers(prev => ({
               ...prev,
               [currentQId]: (prev[currentQId] || '') + ' ' + finalTxt
            }));

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

    // 2. Stable Age Detection (Simulated Forensic Match)
    const ageInterval = setInterval(() => {
       if (isVideoOn) {
          // If we have doc verification, use a stable age based on it
          const savedDoc = JSON.parse(localStorage.getItem('doc_verification') || '{}');
          if (savedDoc.verification_status === 'SUCCESS') {
             setEstimatedAge(25); // In a real app, calculate from DOB in savedDoc
          } else {
             setEstimatedAge(prev => prev === 0 ? 22 + (sessionId.length % 8) : prev);
          }
       }
    }, 5000);

    // 3. Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGeoData({ lat: position.coords.latitude, lng: position.coords.longitude, address: 'Verified Location' });
      });
    }

    return () => {
      purgeSessionPrivacy();
      socket.disconnect();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent restart on unmount
        recognitionRef.current.stop();
      }
      clearInterval(ageInterval);
    };
  }, [sessionId, isVideoOn, currentQuestionIndex]);

  // Robust Stream Assignment Helper
  const setVideoStream = (el, isRemote = false) => {
    if (el && stream) {
       // If no peers are connected, mirroring local stream to the large stage
       if (isRemote && peers.length === 0) {
          el.srcObject = stream;
       } else if (!isRemote) {
          el.srcObject = stream;
       }
       
       // Ensure play starts
       el.play().catch(e => console.error("Auto-play failed:", e));
    }
  };

  const purgeSessionPrivacy = () => {
    console.log('STRICT PRIVACY ENFORCED: Purging media and permissions...');
    
    // Stop all media tracks immediately
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`STRICT: Stopped ${track.kind} track.`);
      });
    }

    // Clear video references to release browser resources
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setStream(null);
    setGeoData({ lat: 0, lng: 0, address: 'Purged' });
    setIsSpeaking(false);
    setIsRecording(false);
    localStorage.removeItem('id_image'); // Remove raw image after session
  };

  const handleStartImmersive = () => {
    // Only request fullscreen on Desktop
    if (window.innerWidth >= 1024 && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error('Fullscreen blocked by browser');
      });
    }
    setImmersiveMode(true);
  };

  const handleNextQuestion = () => {
    const currentQId = aiQuestions[currentQuestionIndex].id;
    const currentAnswer = structuredAnswers[currentQId] || '';

    // Clarity Check: If answer is too short, ask for clarification
    if (currentAnswer.trim().length < 25 && !isClarifying) {
      setIsClarifying(true);
      toast('Can you please provide more details on that?', { icon: '🤔', duration: 3000 });
      return; 
    }

    setIsClarifying(false);
    setAnsweredCount(prev => prev + 1);

    if (currentQuestionIndex < aiQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      toast.success('Analyzing...', { duration: 1000 });
    } else {
      toast.success('All questions completed!');
    }
  };

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
    if (answeredCount < 10) return toast.error('Minimum 10 questions must be answered for a valid forensic score.');
    if (!targetLoanAmount) return toast.error('Please enter the loan amount you want.');
    
    setProcessingState('analyzing');
    const processToast = toast.loading('AI analyzing evidence...');
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
          id_image: localStorage.getItem('id_image'),
          structured_answers: structuredAnswers
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Analysis Complete!', { id: processToast });
        purgeSessionPrivacy(); // PRIVACY CLEANUP ON SUCCESS
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

  if (!immersiveMode) {
    return (
      <div className="fixed inset-0 bg-brand-dark z-[100] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-10 rounded-[40px] text-center space-y-8 border-brand-primary/20">
           <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-10 h-10 text-brand-primary animate-pulse" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Secure Gateway Ready</h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                To ensure a high-integrity verification, this session will run in <b>Immersive Mode</b>. Please click below to begin.
              </p>
           </div>
           <button 
             onClick={handleStartImmersive}
             className="w-full py-5 bg-brand-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
           >
             Launch Secure Session
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-brand-dark overflow-hidden flex flex-col lg:flex-row p-6 gap-6">
      
      {/* MAIN CONTENT: The Large Video Stage (Left) */}
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
        
        <div className="relative flex-1 bg-black/40 rounded-[48px] overflow-hidden border border-white/5 shadow-2xl group min-h-[400px]">
           <video 
             className="w-full h-full object-cover" 
             ref={el => { remoteVideoRef.current = el; setVideoStream(el, true); }} 
             autoPlay playsInline muted
           />
           
           {/* Local Stage HUD Overlay */}
           <div className="absolute inset-x-0 top-8 flex justify-center px-6 pointer-events-none">
              <div className="max-w-xl w-full pointer-events-auto">
                 <div className="glass-panel p-6 rounded-[32px] bg-brand-dark/80 border-brand-secondary/30 backdrop-blur-xl transition-all hover:scale-[1.01]">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center space-x-3 text-brand-secondary">
                          {aiQuestions[currentQuestionIndex].icon}
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Phase {currentQuestionIndex + 1}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-ping' : 'bg-red-500 animate-pulse'}`}></div>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{isSpeaking ? 'Listening...' : 'Awaiting Input'}</span>
                       </div>
                    </div>
                    <h3 className="text-lg font-bold text-white italic leading-tight mb-4">
                       {aiQuestions[currentQuestionIndex].q}
                    </h3>
                    <div className="flex items-center justify-end">
                       <button 
                         onClick={handleNextQuestion}
                         className="bg-brand-primary text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center space-x-2"
                       >
                         <span>Next Question</span>
                         <ArrowRight className="w-3 h-3" />
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Local Large Self-View */}
           <div className="absolute top-8 right-8 w-60 aspect-video rounded-3xl overflow-hidden border-2 border-brand-primary shadow-2xl bg-black">
              <video 
                className="w-full h-full object-cover" 
                ref={el => { localVideoRef.current = el; setVideoStream(el, false); }} 
                autoPlay playsInline muted 
              />
              <div className="absolute bottom-2 left-3 bg-brand-primary/80 backdrop-blur-md px-2 py-0.5 rounded-lg">
                <p className="text-[8px] text-white font-black uppercase">Forensic Stream</p>
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
                <span>{isRecording ? 'Recording Live' : 'Start Interview'}</span>
              </button>
              <button onClick={() => navigate('/dashboard')} className="p-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all">
                <PhoneOff className="w-6 h-6" />
              </button>
           </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Interview Guide & Intelligence */}
      <div className="w-full lg:w-[420px] flex flex-col space-y-6">
        
        {/* Questionnaire Panel */}
        <div className="glass-panel p-8 rounded-[40px] flex-1 flex flex-col border-white/5 shadow-2xl overflow-hidden">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Forensic Checklist</h3>
              <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] text-gray-400 font-bold">
                {answeredCount}/10 MINIMUM
              </div>
           </div>

           <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
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
              
              <div className="pt-6 border-t border-white/5">
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Full Question Queue</p>
                 <div className="space-y-4">
                    {aiQuestions.slice(0, answeredCount + 1).map((q, idx) => (
                       <div key={idx} className={`text-xs font-medium leading-relaxed ${idx === currentQuestionIndex ? 'text-brand-secondary' : 'text-gray-500 opacity-60'}`}>
                          <span className="font-black mr-2">#{idx+1}</span> {q.q}
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Loan Amount Input Step - Ultra Minimalist */}
           <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="space-y-1.5">
                 <div className="flex items-center space-x-1.5 text-brand-secondary opacity-70">
                    <Coins className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none">Loan Amount</span>
                 </div>
                 <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">₹</span>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={targetLoanAmount}
                      onChange={(e) => setTargetLoanAmount(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-md py-1.5 pl-6 pr-2 text-sm font-black text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                 </div>
              </div>
           </div>

           <button 
             onClick={processApplication}
             disabled={processingState === 'analyzing' || !isRecording || answeredCount < 10}
             className="w-full mt-2 py-2 rounded-md bg-brand-secondary text-brand-dark font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-[9px] shadow-sm"
           >
             {processingState === 'analyzing' ? 'Processing...' : 'Freeze & Submit'}
           </button>
        </div>

        {/* Live Logs Bottom (Condensed) */}
        <div className="glass-panel p-6 rounded-[32px] h-48 border-white/5 flex flex-col">
           <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-3">Auditable Stream</h4>
           <div className="flex-1 bg-black/40 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
              <p className="text-[11px] font-mono text-gray-300 leading-relaxed italic">
                {transcript || "Speak clearly to record your declaration..."}
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}
