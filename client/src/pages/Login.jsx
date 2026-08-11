import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Activity, Siren } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        toast.success(formData.rememberMe ? 'Welcome back! Logged in for 1 month.' : 'Welcome back!');
        navigate('/');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }
    // Simulate API call
    toast.success('If an account exists, a reset link has been sent to your email.');
    setShowForgotModal(false);
    setResetEmail('');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col lg:flex-row border border-slate-100">

        {/* Left Side: Creative Tech/Medical Graphic */}
        <div className="lg:w-1/2 bg-[#b71c1c] relative flex flex-col p-10 lg:p-14 overflow-hidden h-full lg:min-h-[700px] justify-between">
          {/* Tech/Network Pattern Background */}
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '32px 32px' }}></div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-white/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-950/40 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold tracking-wider uppercase mb-8 backdrop-blur-sm shadow-sm">
              <Activity size={14} className="text-red-200" /> AI-Powered Network
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Connect.<br />
              Donate.<br />
              <span className="text-red-200">Save Lives.</span>
            </h1>
            <p className="text-red-100 font-medium text-lg mt-6 max-w-sm leading-relaxed">
              Join the smart ecosystem where hospitals and donors unite to combat blood shortages.
            </p>
          </div>

          {/* Abstract UI Elements to look like a tech dashboard/network */}
          <div className="relative z-10 mt-12 flex-grow flex flex-col justify-end pb-4">
            <div className="space-y-4 max-w-sm w-full">
              {/* Floating Match Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-xl transform translate-x-4 hover:translate-x-6 transition-transform cursor-default">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                    <span className="text-white/90 text-xs font-bold uppercase tracking-wider">Live Match</span>
                  </div>
                  <span className="text-white font-black text-lg bg-red-500/40 px-2 py-0.5 rounded-md border border-red-400/30">O-</span>
                </div>
                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-white w-[85%] rounded-full relative">
                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-sm"></div>
                  </div>
                </div>
                <p className="text-white/70 text-xs font-bold mt-3">Routing donor to City Hospital...</p>
              </div>

              {/* Emergency Request Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl transform -translate-x-2 hover:-translate-x-0 transition-transform cursor-default flex items-center gap-4">
                <div className="bg-red-500/40 p-3 rounded-xl text-white border border-red-400/30 shadow-inner">
                  <Siren size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-0.5">Emergency SOS</h4>
                  <p className="text-white/70 text-xs font-medium">B+ blood needed urgently within 2km</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:w-1/2 p-10 lg:p-14 bg-white flex flex-col justify-center h-full lg:min-h-[700px]">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Log In</h2>
            <p className="text-slate-500 mb-8 font-medium text-lg">Please enter your details to sign in.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email" required
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all text-slate-700 font-medium focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)]"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password" required
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all text-slate-700 font-medium focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)]"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer accent-[#b71c1c]"
                    checked={formData.rememberMe}
                    onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  <label htmlFor="rememberMe" className="text-sm font-bold text-slate-600 cursor-pointer select-none">
                    Remember me
                  </label>
                </div>
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm font-bold text-[#b71c1c] hover:text-[#8e0000] transition-colors">Forgot Password?</button>
              </div>

              <button type="submit" className="w-full bg-[#b71c1c] hover:bg-[#8e0000] text-white p-4 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5 mt-6 text-lg flex items-center justify-center gap-2">
                Log In <ArrowRight size={20} />
              </button>
            </form>

            <p className="text-center text-slate-500 mt-10 font-medium">
              Don't have an account? <Link to="/signup" className="text-[#b71c1c] font-black hover:underline transition-all ml-1">Sign up now</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Reset Password</h3>
            <p className="text-slate-500 mb-6 font-medium">Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                required
                className="w-full bg-[#f8fafc] border border-slate-100 rounded-xl p-4 outline-none transition-all text-slate-700 font-medium focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)] mb-4"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-[#b71c1c] hover:bg-[#8e0000] text-white p-4 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
