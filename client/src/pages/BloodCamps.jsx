import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import CreateCampModal from '../components/CreateCampModal';
import { ChevronDown, ChevronUp, Droplet, MapPin, Building2, Phone, Calendar, Clock, Tent, Heart, Sparkles } from 'lucide-react';
import { API_BASE_URL, SOCKET_URL } from '../config';

const socket = io(SOCKET_URL);

export default function BloodCamps() {
  const [camps, setCamps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const { user } = useAuth();
  
  const donationFaqs = [
    { q: "Who can donate blood?", a: "Most people can donate blood if they are in good health, weigh at least 45 kg, and are between 18 and 65 years old. However, eligibility also depends on recent travel, medications, and medical history." },
    { q: "How often can I donate blood?", a: "You must wait at least 8 weeks (56 days) between whole blood donations. For platelet donations, the wait is typically much shorter." },
    { q: "Is it safe to donate blood?", a: "Yes. Sterile, single-use equipment is used for each donor, making it impossible to catch a disease from donating." },
    { q: "What should I do before donating?", a: "Drink plenty of water, eat a healthy meal avoiding fatty foods, and ensure you have had a good night's sleep." }
  ];

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/camps`, {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setCamps(data);
      })
      .catch(err => console.error(err));

    socket.on('new_camp', (data) => {
      setCamps(prev => [...prev, data]);
    });

    return () => {
      socket.off('new_camp');
    };
  }, []);

  const upcomingCamps = camps.filter(camp => new Date(camp.date) >= new Date(new Date().setHours(0,0,0,0)));
  upcomingCamps.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Header */}
      <header className="relative bg-gradient-to-br from-red-50 via-white to-red-50 p-8 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-[#b71c1c] font-bold text-xs uppercase tracking-wider mb-4">
              <Tent size={14} /> Community Drives
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">
              Upcoming Blood Camps
            </h1>
            <p className="text-slate-600 text-lg font-medium max-w-xl">
              Join local blood donation drives and become a hero in your community. Every drop counts.
            </p>
          </div>
          
          <div className="flex gap-3">
            {user && ['hospital', 'organization', 'admin'].includes(user.role) && (
              <button 
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-[#b71c1c] to-[#d32f2f] hover:from-[#8e0000] hover:to-[#b71c1c] text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-900/20 transform hover:-translate-y-1 flex items-center gap-2"
              >
                <Sparkles size={20} /> Organize a Camp
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Camps Grid */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          Scheduled Drives <span className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full">{upcomingCamps.length}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingCamps.length === 0 ? (
            <div className="col-span-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-16 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-red-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">No Camps Scheduled</h3>
              <p className="text-slate-500 text-lg mb-6">There are no upcoming blood camps at the moment.</p>
              {user && ['hospital', 'organization', 'admin'].includes(user.role) && (
                <button onClick={() => setShowModal(true)} className="text-[#b71c1c] font-bold hover:underline flex items-center gap-2">
                  <Tent size={18} /> Be the first to organize one!
                </button>
              )}
            </div>
          ) : (
            upcomingCamps.map(camp => {
              const campDate = new Date(camp.date);
              return (
                <div key={camp._id} className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-red-200 hover:shadow-xl transition-all group flex flex-col">
                  {/* Card Header (Date & Time) */}
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 border-b border-red-100/50 flex justify-between items-center relative overflow-hidden">
                    <Droplet className="absolute -right-4 -bottom-4 w-24 h-24 text-red-500 opacity-5 group-hover:scale-125 transition-transform duration-500" />
                    
                    <div className="bg-white rounded-2xl p-3 text-center min-w-[70px] shadow-sm border border-red-100 relative z-10">
                      <p className="text-xs font-black text-red-600 uppercase tracking-widest">{campDate.toLocaleString('default', { month: 'short' })}</p>
                      <p className="text-2xl font-black text-slate-800 leading-none mt-1">{campDate.getDate()}</p>
                    </div>
                    <div className="text-right relative z-10">
                      <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Time</p>
                      <p className="text-lg font-black text-slate-700 flex items-center gap-1.5 justify-end">
                        <Clock size={16} className="text-slate-400" />
                        {campDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6 flex-grow flex flex-col bg-white">
                    <h3 className="font-black text-xl text-slate-800 mb-4 line-clamp-1">Blood Donation Drive</h3>
                    
                    <div className="space-y-4 mb-6 flex-grow">
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-50 p-2 rounded-xl mt-0.5">
                          <MapPin size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</p>
                          <p className="text-sm font-bold text-slate-700">{camp.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-50 p-2 rounded-xl mt-0.5">
                          <Building2 size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Organizer</p>
                          <p className="text-sm font-bold text-slate-700">{camp.organizerName}</p>
                        </div>
                      </div>
                    </div>
                    
                    {camp.details && (
                      <div className="bg-slate-50 p-4 rounded-2xl text-sm font-medium text-slate-600 mb-6 italic border border-slate-100 relative">
                        <span className="text-3xl text-slate-300 absolute -top-2 left-2">"</span>
                        <p className="relative z-10 pl-2">{camp.details}</p>
                      </div>
                    )}
                    
                    {/* Card Footer */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={16} className="text-slate-400" />
                        <span className="text-sm font-bold">{camp.contactNumber}</span>
                      </div>
                      <a href={`tel:${camp.contactNumber}`} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        Call
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/3 bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <Droplet className="w-16 h-16 text-red-500 mb-6 relative z-10" />
          <h2 className="text-3xl font-black mb-4 relative z-10">Got Questions?</h2>
          <p className="text-slate-300 font-medium relative z-10">
            Learn everything you need to know about donating blood safely and effectively.
          </p>
        </div>
        
        <div className="md:w-2/3 p-8 md:p-12">
          <div className="space-y-4">
            {donationFaqs.map((faq, qIdx) => {
              const isOpen = openFaqIndex === qIdx;
              return (
                <div key={qIdx} className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-red-200 bg-red-50/30 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                  <button 
                    onClick={() => setOpenFaqIndex(isOpen ? null : qIdx)}
                    className="w-full flex justify-between items-center text-left p-5 focus:outline-none"
                  >
                    <span className="font-bold text-slate-800 pr-4">{faq.q}</span>
                    <span className={`p-1.5 rounded-full transition-colors ${isOpen ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  <div className={`px-5 pb-5 text-sm font-medium text-slate-600 leading-relaxed transition-all duration-300 ${isOpen ? 'block opacity-100' : 'hidden opacity-0'}`}>
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && <CreateCampModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
