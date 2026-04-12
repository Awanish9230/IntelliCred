import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Video, 
  Zap, 
  Lock, 
  UserCheck,
  Star,
  Quote
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      toast.success('Redirecting to your dashboard...');
      navigate('/dashboard');
    } else {
      toast('Redirecting to secure signup...', { icon: '🔒' });
      navigate('/signup');
    }
  };

  const features = [
    { 
      icon: <Video className="w-6 h-6" />, 
      title: "Video KYC", 
      desc: "Real-time verification through secure video calls without visiting a branch." 
    },
    { 
      icon: <Zap className="w-6 h-6" />, 
      title: "Instant Decision", 
      desc: "AI-driven risk analysis provides an immediate loan offer in minutes." 
    },
    { 
      icon: <Lock className="w-6 h-6" />, 
      title: "Secure & Encrypted", 
      desc: "End-to-end encryption for your data and video sessions." 
    }
  ];

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-primary to-brand-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      {/* HERO SECTION */}
      <section className="px-6 pt-20 pb-32 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-secondary text-xs font-bold uppercase tracking-widest mb-8">
               <Star className="w-4 h-4 fill-current" />
               <span>Trusted by 10,000+ users worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary underline decoration-brand-secondary/30">Instant</span> Loan Approval
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-400 mb-12">
              Experience the next generation of financial onboarding. Secure video verification and intelligent risk assessment for instant decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={handleCTA}
                className="w-full sm:w-auto bg-brand-primary hover:bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-brand-primary/30 flex items-center justify-center space-x-3 transition-all hover:scale-105"
              >
                <span>Start Application</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto glass-panel hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 py-24 sm:py-32 bg-black/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">Powered by Advanced Tech</h2>
            <div className="w-20 h-1 bg-brand-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-3xl group hover:border-brand-primary/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS UI */}
      <section className="px-6 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Simple 3-Step Process</h2>
            <p className="text-gray-400">From application to approval in under 10 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             {/* Connector lines (Desktop) */}
             <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>
             
             {[
               { id: '1', title: 'Join Call', sub: 'Connect with our secure video module' },
               { id: '2', title: 'AI Analysis', sub: 'STT and Age Detection triggers' },
               { id: '3', title: 'Get Offer', sub: 'Instant decision based on risk logic' }
             ].map((step, idx) => (
               <div key={idx} className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full glass-panel mx-auto flex items-center justify-center border-2 border-brand-primary text-2xl font-black text-white">
                    {step.id}
                  </div>
                  <h4 className="text-xl font-bold text-white uppercase tracking-wider">{step.title}</h4>
                  <p className="text-gray-500 text-sm max-w-[200px] mx-auto leading-relaxed">{step.sub}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-5xl glass-panel rounded-[40px] p-12 text-center relative overflow-hidden bg-brand-primary/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 blur-[100px] -mr-20 -mt-20"></div>
          <h2 className="text-4xl font-bold text-white mb-8">Ready to get your instant loan?</h2>
          <button 
            onClick={handleCTA}
            className="bg-white text-brand-primary hover:bg-gray-100 px-12 py-5 rounded-3xl font-bold text-xl transition-all shadow-2xl hover:scale-105"
          >
            Start Your Journey
          </button>
        </div>
      </section>
    </div>
  );
}
