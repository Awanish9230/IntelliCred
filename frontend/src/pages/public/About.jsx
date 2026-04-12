import React from 'react';
import { Target, Users, Zap, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-6">Our Vision for the Future of Finance</h1>
        <p className="text-xl text-gray-400">IntelliCred is revolutionizing the way loans are approved by bridging the gap between security and speed through AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32 items-center">
        <div className="glass-panel p-10 rounded-[40px] border-brand-primary/20">
          <h2 className="text-3xl font-bold text-white mb-6">The Problem We Solve</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Traditional loan onboarding is slow, paperwork-heavy, and prone to identity fraud. Users often wait days for results that should be available in minutes.
          </p>
          <p className="text-gray-400 leading-relaxed">
            IntelliCred uses real-time Video KYC, Speech-to-Text inference, and age-detection models to verify identity and assess risk instantly, ensuring a seamless experience for legitimate users while keeping fraud at bay.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square glass-panel rounded-3xl flex flex-col items-center justify-center p-6 text-center">
            <Zap className="w-10 h-10 text-brand-secondary mb-4" />
            <span className="text-sm font-bold text-white uppercase tracking-widest">Fast</span>
          </div>
          <div className="aspect-square glass-panel rounded-3xl flex flex-col items-center justify-center p-6 text-center">
            <Users className="w-10 h-10 text-brand-primary mb-4" />
            <span className="text-sm font-bold text-white uppercase tracking-widest">Human Centric</span>
          </div>
          <div className="aspect-square glass-panel rounded-3xl flex flex-col items-center justify-center p-6 text-center">
            <Target className="w-10 h-10 text-green-400 mb-4" />
            <span className="text-sm font-bold text-white uppercase tracking-widest">Accurate</span>
          </div>
          <div className="aspect-square glass-panel rounded-3xl flex flex-col items-center justify-center p-6 text-center">
            <Award className="w-10 h-10 text-yellow-500 mb-4" />
            <span className="text-sm font-bold text-white uppercase tracking-widest">Secure</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-12">The Tech Stack</h3>
        <div className="flex flex-wrap justify-center gap-6">
           {['AI + LLM', 'Video KYC', 'TensorFlow', 'WebRTC', 'MERN Stack'].map(tech => (
             <span key={tech} className="px-8 py-4 glass-panel rounded-2xl text-brand-secondary font-bold text-sm tracking-widest uppercase">{tech}</span>
           ))}
        </div>
      </div>
    </div>
  );
}
