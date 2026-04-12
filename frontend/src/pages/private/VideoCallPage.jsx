import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Code, Loader2 } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [processingState, setProcessingState] = useState(null); // 'analyzing', 'done'
  const [decision, setDecision] = useState(null);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peersRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Validate session
    fetch(`${apiUrl}/session/validate/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          toast.error('Invalid or expired session');
          navigate('/dashboard');
        }
      })
      .catch(err => toast.error('Validation failed'));

    // 1. Get User Media
    toast.promise(
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }),
      {
        loading: 'Connecting to camera & microphone...',
        success: 'Media access granted',
        error: 'Camera or Microphone access denied'
      }
    ).then(currentStream => {
      setStream(currentStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = currentStream;
      }

      socket.emit('join-room', sessionId, socket.id);

      // WebRTC logic (Simple 1-1 mapping for demo)
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

    }).catch(err => console.error("Media Error: ", err));

    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTxt = event.results[i][0].transcript;
            setTranscript(prev => prev + ' ' + finalTxt);
            // Send chunk to backend
            fetch(`${apiUrl}/transcript`, {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ sessionId, text: finalTxt, speaker: 'customer' })
            });
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };
    }

    return () => {
      socket.disconnect();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [sessionId]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });
    peer.on('signal', signal => {
      socket.emit('offer', { userToSignal, callerID, signal, target: userToSignal });
    });
    peer.on('stream', remoteStream => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    });
    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    peer.on('signal', signal => {
      socket.emit('answer', { signal, callerID, id: socket.id, target: callerID });
    });
    peer.on('stream', remoteStream => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    });
    peer.signal(incomingSignal);
    return peer;
  };

  const toggleRecording = () => {
    if (!isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        toast.success('Live STT capturing enabled', { icon: '🎤' });
      }
      setIsRecording(true);
    } else {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      toast('STT capturing paused', { icon: '⏸️' });
    }
  };

  const processApplication = async () => {
    setProcessingState('analyzing');
    const processToast = toast.loading('AI Engine analyzing your transcript...');
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/process-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, age: 25, location: 'Virtual' })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Risk assessment complete!', { id: processToast });
        setDecision(data.decision);
        // Redirect to result page after a short delay
        setTimeout(() => {
          navigate('/loan-result', { state: { decision: data.decision } });
        }, 2000);
      } else {
        toast.error(data.error || 'Processing failed', { id: processToast });
      }
    } catch (err) {
      toast.error('Network error during analysis', { id: processToast });
    } finally {
      setProcessingState('done');
    }
  };

  const toggleVideo = () => {
    const videoTrack = stream.getTracks().find(track => track.kind === 'video');
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  const toggleMic = () => {
    const audioTrack = stream.getTracks().find(track => track.kind === 'audio');
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Video Stream & Controls */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Verification Status Banner */}
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Live Verification Session</h2>
              <p className="text-sm text-gray-400 font-mono mt-1">ID: {sessionId}</p>
            </div>
            <div className="flex items-center space-x-2">
               <span className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
               </span>
               <span className="text-green-500 font-medium text-sm">Secure Connection</span>
            </div>
        </div>

        {/* Video Area */}
        <div className="relative bg-black rounded-3xl overflow-hidden aspect-video border border-gray-800 shadow-2xl">
          <video className="w-full h-full object-cover" ref={remoteVideoRef} autoPlay playsInline />
          
          {/* Local Mini Video */}
          <div className="absolute bottom-6 flex justify-between w-full px-6 items-end pointer-events-none">
            <div className="w-48 aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-brand-primary shadow-lg pointer-events-auto">
              <video className="w-full h-full object-cover" ref={localVideoRef} autoPlay playsInline muted />
            </div>

            {/* Controls */}
            <div className="flex space-x-3 pointer-events-auto bg-black/50 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <button onClick={toggleMic} className={`p-3 rounded-xl transition ${isMicOn ? 'bg-gray-700/80 hover:bg-gray-600' : 'bg-red-500/80 hover:bg-red-400'}`}>
                {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <button onClick={toggleVideo} className={`p-3 rounded-xl transition ${isVideoOn ? 'bg-gray-700/80 hover:bg-gray-600' : 'bg-red-500/80 hover:bg-red-400'}`}>
                {isVideoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
              <button onClick={() => navigate('/')} className="p-3 rounded-xl bg-red-600 hover:bg-red-700 transition">
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Transcript & Intelligence Panel */}
      <div className="space-y-4 flex flex-col h-full">
        {/* Record & Analyze Controls */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
           <h3 className="font-semibold text-lg flex items-center">
             <Code className="w-5 h-5 mr-2 text-brand-secondary" />
             AI Intelligence Layer
           </h3>
           <div className="flex space-x-2">
             <button 
                onClick={toggleRecording}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-brand-primary text-white hover:bg-indigo-600'}`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording & STT'}
             </button>
             <button 
                onClick={processApplication}
                disabled={processingState === 'analyzing'}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/50 font-medium hover:bg-brand-secondary/30 transition-colors disabled:opacity-50"
             >
                {processingState === 'analyzing' ? 'Analyzing...' : 'Process Application'}
             </button>
           </div>
        </div>

        {/* Live Transcript */}
        <div className="glass-panel rounded-2xl p-5 flex-1 flex flex-col min-h-[250px]">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">Live Transcript</h3>
          <div className="flex-1 bg-black/40 rounded-xl p-4 overflow-y-auto text-sm text-gray-300 font-mono leading-relaxed border border-white/5">
            {transcript || "Waiting for speech..."}
          </div>
        </div>

        {/* Decision Output */}
        {decision && (
          <div className={`glass-panel rounded-2xl p-5 border ${decision.eligible ? 'border-green-500/50' : 'border-red-500/50'}`}>
            <h3 className="font-semibold mb-3 text-lg">System Decision</h3>
            {decision.eligible ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                   <span className="text-green-400 font-medium">Status</span>
                   <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Approved</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-black/40 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-500">Loan Amount</div>
                    <div className="text-2xl font-bold text-white">₹{decision.loan_amount}</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-500">Interest Rate</div>
                    <div className="text-2xl font-bold text-brand-secondary">{decision.interest_rate}%</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">{decision.reason}</p>
              </div>
            ) : (
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-center space-y-2">
                <span className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide inline-block mb-2">Rejected</span>
                <p className="text-red-400 text-sm font-medium">{decision.reason}</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
