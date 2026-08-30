import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ActiveSOS from './pages/ActiveSOS';
import BloodCamps from './pages/BloodCamps';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';
import Profile from './pages/Profile';
import FAQ from './pages/FAQ';
import { SOCKET_URL } from './config';

const socket = io(SOCKET_URL);

const getCompatibleDonors = (bg) => {
  const map = {
    'A+': 'A+, A-, O+, O-',
    'A-': 'A-, O-',
    'B+': 'B+, B-, O+, O-',
    'B-': 'B-, O-',
    'AB+': 'Everyone (All Groups)',
    'AB-': 'AB-, A-, B-, O-',
    'O+': 'O+, O-',
    'O-': 'O- (Universal Donor)'
  };
  return map[bg] || 'Unknown';
};

function App() {
  useEffect(() => {
    socket.on('new_sos_alert', (data) => {
      let isSender = false;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          if (userObj && (data.requesterId?._id === userObj.id || data.requesterId === userObj.id)) {
            isSender = true;
          }
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }

      if (isSender) {
        return;
      }

      toast.custom(
        (t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-red-600 shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-lg font-bold text-white flex items-center gap-2">
                    🚨 EMERGENCY SOS
                  </p>
                  <p className="mt-1 text-sm font-medium text-red-100">
                    {data.details}
                  </p>
                  <div className="mt-2 text-xs text-red-200">
                    <p>Required: {data.resourceType === 'blood' && data.bloodGroup ? `${data.bloodGroup} Blood` : data.resourceType} | Urgency: {data.urgency.toUpperCase()}</p>
                    <p>Contact: {data.requesterId?.name} - {data.requesterId?.contactNumber || 'No number provided'}</p>
                    {data.resourceType === 'blood' && data.bloodGroup && (
                      <p className="mt-1 font-bold text-white bg-red-700/50 p-1 rounded">
                        Compatible Donors: {getCompatibleDonors(data.bloodGroup)}
                      </p>
                    )}
                  </div>
                  {data.location && data.location.lat ? (
                    <a 
                      href={`https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-3 inline-block bg-white text-red-600 px-3 py-1.5 rounded text-xs font-bold shadow hover:bg-red-50"
                    >
                      📍 View on Google Maps
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex border-l border-red-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-100 hover:text-white hover:bg-red-700 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ),
        { duration: 30000, position: 'top-center' }
      );
    });

    return () => {
      socket.off('new_sos_alert');
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <Toaster position="top-center" />
          <Chatbot />
          <main className="flex-grow p-4 md:p-8">
            <Routes>
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/camps" element={<ProtectedRoute><BloodCamps /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/faq" element={<FAQ />} />
              
              {/* Public Routes */}
              <Route path="/sos" element={<ActiveSOS />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signin" element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/register" element={<Navigate to="/signup" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
