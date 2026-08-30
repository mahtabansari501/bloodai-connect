import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import EmergencySOSModal from './EmergencySOSModal';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [showSOS, setShowSOS] = useState(false);
  const { user, logout, userMode, toggleUserMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkStyle = (path) => {
    const active = isActive(path);
    return `whitespace-nowrap text-sm font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-medicalBlue after:transition-all after:duration-300 ${active ? 'text-medicalBlue after:w-full font-bold' : 'text-slate-600 hover:text-medicalBlue'
      }`;
  };

  return (
    <>
      <nav className="glass sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group select-none">
                <div className="w-12 h-12 bg-gradient-to-br from-red-300 via-[#b71c1c] to-red-900 rounded-[14px] flex items-center justify-center shadow-md relative overflow-hidden border border-white/40">
                  <Activity className="h-7 w-7 text-white absolute z-10 drop-shadow-md" />
                  <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="flex flex-col justify-center pt-1">
                  <span className="font-sans text-2xl tracking-tight leading-none flex items-center">
                    <span className="font-black text-[#b71c1c]">Blood</span>
                    <span className="font-black text-[#0d2a63]">AI</span>
                    <span className="text-[#3b4b59] font-semibold ml-1.5 text-[22px] hidden sm:inline">Connect</span>
                  </span>
                  <span className="hidden md:block text-[#3b4b59] text-[11px] font-medium tracking-wide mt-0.5 opacity-80 whitespace-nowrap">Connecting Lives, Smartly.</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3 md:gap-6 overflow-x-auto no-scrollbar pl-2">
              {user && <Link to="/" className={navLinkStyle('/')}>Dashboard</Link>}
              <Link to="/sos" className={navLinkStyle('/sos')}>SOS Alerts</Link>
              {user && <Link to="/camps" className={navLinkStyle('/camps')}>Blood Camps</Link>}
              {user && <Link to="/map" className={navLinkStyle('/map')}>Live Map</Link>}

              {user?.role === 'donor' && (
                <div className="flex items-center bg-slate-100 p-1 rounded-xl ml-2">
                  <button
                    onClick={() => toggleUserMode('donor')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${userMode === 'donor' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Helper Mode
                  </button>
                  <button
                    onClick={() => toggleUserMode('accepter')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${userMode === 'accepter' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Requester Mode
                  </button>
                </div>
              )}

              {user ? (
                <div className="flex items-center gap-4 pl-4 ml-2 border-l border-slate-200">
                  <Link to="/profile" className="text-sm font-semibold text-slate-700 hover:text-medicalBlue transition-colors flex items-center gap-2 hidden md:flex">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.name}
                  </Link>
                  <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-bloodRed transition-colors">Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <Link 
                    to="/login" 
                    className={
                      isActive('/login')
                        ? 'text-sm font-semibold text-white bg-slate-900 px-4 py-2 rounded-lg transition-all shadow-md'
                        : 'text-sm font-medium text-slate-600 hover:text-medicalBlue transition-colors'
                    }
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className={
                      isActive('/login')
                        ? 'text-sm font-medium text-slate-600 hover:text-medicalBlue transition-colors'
                        : 'text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg'
                    }
                  >
                    Signup
                  </Link>
                </div>
              )}

              <button
                onClick={() => setShowSOS(true)}
                className="ml-1 md:ml-3 whitespace-nowrap bg-[#b71c1c] hover:bg-[#8e0000] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(183,28,28,0.39)] hover:shadow-[0_6px_20px_rgba(183,28,28,0.23)] transition-all flex items-center gap-2 border border-[#b71c1c]/50">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </div>
                <span className="tracking-wide">SOS</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showSOS && <EmergencySOSModal onClose={() => setShowSOS(false)} />}
    </>
  );
}
