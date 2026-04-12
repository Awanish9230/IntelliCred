import React from 'react';
import { Camera, Search, BarChart, CreditCard, ChevronRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { 
      title: 'Join Video Call', 
      desc: 'Start a secure WebRTC session from your dashboard. No specialist hardware required, just your webcam.',
      icon: <Camera className="w-8 h-8 text-brand-secondary" />
    },
    { 
      title: 'Answer Questions', 
      desc: 'Our AI listens to your voice, detects your age, and transcribes your answers in real-time.',
      icon: <Search className="w-8 h-8 text-brand-primary" />
    },
    { 
      title: 'AI Analysis', 
      desc: 'Large Language Models (LLM) parse the transcript to extract income, employment, and risk flags.',
      icon: <BarChart className="w-8 h-8 text-indigo-400" />
    },
    { 
      title: 'Get Loan Offer', 
      desc: 'The Risk Engine processes all data and generates an instant loan result on your screen.',
      icon: <CreditCard className="w-8 h-8 text-green-400" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 animate-in fade-in duration-700">
      <div className="text-center mb-24">
        <h1 className="text-5xl font-bold text-white mb-6 uppercase tracking-tighter">Technology that simplifies finance</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
          Four simple steps to verify your identity and get your loan offer. Fully automated, fully secure.
        </p>
      </div>

      <div className="space-y-12">
        {steps.map((step, idx) => (
          <div key={idx} className="group flex flex-col md:flex-row items-center gap-12 glass-panel p-10 rounded-[40px] hover:bg-white/5 transition-all">
            <div className="w-24 h-24 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {step.icon}
            </div>
            
            <div className="flex-1 text-center md:text-left">
               <div className="text-white text-xs font-bold uppercase tracking-[0.3em] mb-3 text-brand-secondary">Step {idx + 1}</div>
               <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">{step.title}</h3>
               <p className="text-gray-400 max-w-xl text-lg font-light leading-relaxed">{step.desc}</p>
            </div>

            {idx < steps.length - 1 && (
              <div className="hidden lg:block">
                 <ChevronRight className="w-10 h-10 text-gray-700 font-thin" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 glass-panel rounded-[40px] text-center border-brand-primary/20">
         <h2 className="text-3xl font-bold text-white mb-8">Ready to see it in action?</h2>
         <button className="bg-brand-primary hover:bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 transition-all hover:scale-105">
           Create Your Account
         </button>
      </div>
    </div>
  );
}
