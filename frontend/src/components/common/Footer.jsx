import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Globe, MessageSquare, Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20 pb-12 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto pt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase letter-spacing-widest">IntelliCred</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Providing modern AI-driven financial solutions. Secure, fast, and fully remote loan onboarding for everyone.
            </p>
            <div className="flex items-center space-x-5">
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-brand-primary transition-colors text-white" title="Social">
                <MessageSquare className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-brand-primary transition-colors text-white" title="GitHub">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-brand-primary transition-colors text-white" title="LinkedIn">
                <Briefcase className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it Works</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">User Dashboard</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Login</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-sm border-t border-white/5 pt-8">
            <p>© {new Date().getFullYear()} IntelliCred AI. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
        </div>
      </div>
    </footer>
  );
}
