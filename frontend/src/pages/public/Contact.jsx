import React, { useState } from 'react';
import { Mail, MessageSquare, Send, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mimic API call
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Info Column */}
        <div className="space-y-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-6">Get in Touch</h1>
            <p className="text-xl text-gray-400 font-light leading-relaxed">
              Have questions about our AI loan technology or security? Our team is here to help you scaling your financial future.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-brand-secondary">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold">Email Us</h4>
                <p className="text-gray-400">awanishverma864@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-brand-primary">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold">Call Support</h4>
                <p className="text-gray-400">7390083864</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-green-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold">HQ Office</h4>
                <p className="text-gray-400">Ghaziabad Uttar Pradesh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="glass-panel p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-5 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
             <MessageSquare className="w-6 h-6 mr-3 text-brand-secondary" />
             Send Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-white"
                placeholder="Ex. John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Work Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-white"
                placeholder="john@intellicred.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Message</label>
              <textarea 
                rows="4"
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-white resize-none"
                placeholder="Tell us what you're thinking..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-indigo-600 font-bold py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              <span>{loading ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
