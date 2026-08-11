import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Building2, Pill, Users, Heart, Lock, Mail, Phone, User, MapPinned, Siren, Database, Tent, HelpCircle, ArrowRight, HeartHandshake, Code } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'hospital',
    contactNumber: '',
    bloodGroup: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        toast.success('Registration successful!');
        navigate('/');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return 0;
    if (pass.length < 5) return 1;
    if (pass.length < 8) return 2;
    return 3;
  };

  const passStrength = getPasswordStrength(formData.password);

  const roles = [
    { id: 'hospital', label: 'Hospital', icon: Building2 },
    { id: 'pharmacy', label: 'Blood Bank', icon: Pill },
    { id: 'donor', label: 'Individual', icon: User },
    { id: 'organization', label: 'Org / NGO', icon: Users },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col lg:flex-row border border-slate-100">

        {/* Left Side: Information & Guide */}
        <div className="lg:w-1/2 bg-[#fdfaf8] relative flex flex-col border-r border-slate-100 h-full max-h-[850px] overflow-y-auto custom-scrollbar">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b71c1c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

          <div className="relative z-10 p-10 lg:p-14">
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 leading-[1.2] tracking-tight mb-2">
              Welcome to <span className="text-[#b71c1c]">BloodAI</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg mb-10">
              The smart network connecting lifesavers with those in need.
            </p>

            {/* Who Can Use It */}
            <div className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Users size={16} /> Who Can Use It?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Building2 size={20} /></div>
                  <span className="font-bold text-sm text-slate-700">Hospitals</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded-lg text-red-600"><User size={20} /></div>
                  <span className="font-bold text-sm text-slate-700">Individuals</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Pill size={20} /></div>
                  <span className="font-bold text-sm text-slate-700">Blood Banks</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-lg text-green-600"><HeartHandshake size={20} /></div>
                  <span className="font-bold text-sm text-slate-700">NGOs</span>
                </div>
              </div>
            </div>

            {/* How To Use */}
            <div className="mb-10">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <HelpCircle size={16} /> How To Use?
              </h3>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-red-100 text-[#b71c1c] shadow shrink-0 z-10 font-bold text-sm">1</div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4 md:ml-0">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Create Account</h4>
                    <p className="text-xs text-slate-500 font-medium">Select your role and register securely.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-red-100 text-[#b71c1c] shadow shrink-0 z-10 font-bold text-sm">2</div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4 md:ml-0">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Monitor & Alert</h4>
                    <p className="text-xs text-slate-500 font-medium">Update inventory or raise SOS alerts.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-red-100 text-[#b71c1c] shadow shrink-0 z-10 font-bold text-sm">3</div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4 md:ml-0">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">AI Matchmaking</h4>
                    <p className="text-xs text-slate-500 font-medium">AI connects requesters with donors instantly.</p>
                  </div>
                </div>

              </div>
            </div>




          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="lg:w-1/2 p-10 lg:p-14 bg-white flex flex-col justify-center h-full max-h-[850px] overflow-y-auto custom-scrollbar">
          <div className="max-w-md w-full mx-auto py-4">
            <h2 className="text-3xl font-black text-slate-800 mb-8 text-center">Create Account</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Organization / User Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text" required
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all text-slate-700 font-medium focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)]"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name or organization"
                  />
                </div>
              </div>

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
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Contact Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel" required
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all text-slate-700 font-medium focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)]"
                    value={formData.contactNumber}
                    onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
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
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-3.5 pl-11 pr-28 outline-none transition-all text-slate-700 font-medium focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)]"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  {/* Password Strength Indicator */}
                  <div className="absolute inset-y-0 right-9 pr-2 flex items-center gap-1 pointer-events-none">
                    <div className={`h-1.5 w-4 rounded-full transition-colors ${passStrength >= 1 ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-1.5 w-4 rounded-full transition-colors ${passStrength >= 2 ? 'bg-yellow-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-1.5 w-4 rounded-full transition-colors ${passStrength >= 3 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-1 font-medium">
                  {passStrength === 0 && "Must be at least 8 characters long."}
                  {passStrength === 1 && <span className="text-red-500">Weak: Add more characters.</span>}
                  {passStrength === 2 && <span className="text-yellow-600">Fair: Add numbers & special symbols.</span>}
                  {passStrength === 3 && <span className="text-green-600 font-bold">Strong password!</span>}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                <div className="grid grid-cols-4 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.role === r.id
                          ? 'border-[#b71c1c] bg-red-50 text-[#b71c1c] shadow-sm'
                          : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <r.icon className={`w-6 h-6 mb-1.5 ${formData.role === r.id ? 'text-[#b71c1c]' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.role === 'donor' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Blood Group</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Heart className="h-5 w-5 text-red-500" />
                    </div>
                    <select
                      required
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all text-slate-700 font-medium focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)] appearance-none"
                      value={formData.bloodGroup}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      <option value="" disabled>Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-[#b71c1c] hover:bg-[#8e0000] text-white p-4 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5 mt-4 text-lg flex items-center justify-center gap-2">
                Sign Up <ArrowRight size={20} />
              </button>
            </form>

            <p className="text-center text-slate-500 mt-8 font-medium pb-4">
              Already have an account? <Link to="/login" className="text-[#b71c1c] font-black hover:underline transition-all ml-1">Log In</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Key Features (Soft Highlighted Bottom Section) */}
      <div className="w-full max-w-6xl mt-8 mb-8 bg-gradient-to-r from-red-50 to-rose-50 p-6 md:p-8 rounded-[2.5rem] border border-red-100 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#b71c1c] mb-6 flex items-center justify-center gap-2">
          <Siren size={18} /> Why Choose BloodAI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="bg-red-100 p-3 rounded-2xl text-red-600"><MapPinned size={24} /></div>
            <span className="font-bold text-slate-800 text-lg">Live Map Tracking</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Find nearby hospitals, blood banks, and live donors on an interactive real-time map.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="bg-orange-50 p-3 rounded-2xl text-orange-500"><Siren size={24} /></div>
            <span className="font-bold text-slate-800 text-lg">Emergency SOS</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Instantly broadcast urgent blood needs to compatible donors and hospitals with a single click.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-500"><Database size={24} /></div>
            <span className="font-bold text-slate-800 text-lg">Smart Inventory</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">AI automatically predicts blood shortages and manages hospital resources smartly.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="bg-green-50 p-3 rounded-2xl text-green-500"><Tent size={24} /></div>
            <span className="font-bold text-slate-800 text-lg">Blood Camps</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Discover, organize, and participate in community blood donation drives effortlessly.</p>
          </div>
        </div>
      </div>

      {/* Support / Dev Contact (Footer) */}
      <div className="w-full max-w-6xl mt-2 mb-10">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 shrink-0">
              <Phone className="text-red-500 w-8 h-8" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-2xl mb-1">Contact Us</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mt-2">
                <span className="text-slate-700 font-bold">Thank you for using BloodAI Connect!</span><br />
                For any issues, support, or queries, please feel free to reach out to us.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 relative z-10 w-full md:w-auto bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <a href="mailto:mahtabansari56208@gmail.com" className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 hover:shadow-md transition-all group">
              <div className="bg-red-50 p-2.5 rounded-xl text-red-600 group-hover:scale-110 transition-transform"><Mail size={20} /></div>
              <span className="font-bold text-slate-700 group-hover:text-red-600 transition-colors">mahtabansari56208@gmail.com</span>
            </a>

            <a href="tel:6202023703" className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 hover:border-green-200 hover:shadow-md transition-all group">
              <div className="bg-green-50 p-2.5 rounded-xl text-green-600 group-hover:scale-110 transition-transform"><Phone size={20} /></div>
              <span className="font-bold text-slate-700 group-hover:text-green-600 transition-colors">+91 6202023703</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
