import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, MapPin, Droplet, Phone, Activity, HeartHandshake, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL, SOCKET_URL } from '../config';

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

export default function ActiveSOS() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [matchResults, setMatchResults] = useState({});
  const [acceptingId, setAcceptingId] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'mine'
  const [liveDonorLocations, setLiveDonorLocations] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sos`)
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setActiveAlerts(data); })
      .catch(err => console.error(err));

    socket.on('new_sos_alert', (data) => setActiveAlerts(prev => [data, ...prev]));
    socket.on('sos_resolved', (data) => setActiveAlerts(prev => prev.filter(a => a._id !== data.alertId)));
    socket.on('sos_updated', (data) => setActiveAlerts(prev => prev.map(a => a._id === data._id ? data : a)));
    
    socket.on('donor_location_update', (data) => {
      setLiveDonorLocations(prev => ({
        ...prev,
        [data.donorId]: { lat: data.lat, lng: data.lng, timestamp: Date.now() }
      }));
    });

    return () => {
      socket.off('new_sos_alert');
      socket.off('sos_resolved');
      socket.off('sos_updated');
      socket.off('donor_location_update');
    };
  }, []);

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sos/${alertId}/resolve`, {
        method: 'PATCH',
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      if (!res.ok) toast.error("Failed to resolve alert");
      else toast.success("Emergency Resolved!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptAlert = async (alertId) => {
    if (!user) return toast.error("Please login to help");
    setAcceptingId(alertId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sos/${alertId}/accept`, {
        method: 'PATCH',
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();
      if (res.ok) toast.success(data.message);
      else toast.error(data.error);
    } catch (err) {
      toast.error("Network error");
    }
    setAcceptingId(null);
  };

  const handleWithdrawAlert = async (alertId) => {
    setAcceptingId(alertId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sos/${alertId}/withdraw`, {
        method: 'PATCH',
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();
      if (res.ok) toast.success(data.message);
      else toast.error(data.error);
    } catch (err) {
      toast.error("Network error");
    }
    setAcceptingId(null);
  };

  const handleMatch = async (alert) => {
    setMatchResults(prev => ({ ...prev, [alert._id]: { loading: true } }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/predict/match-sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sosDetails: alert.details,
          resourceType: alert.resourceType,
          urgency: alert.urgency,
          bloodGroup: alert.bloodGroup // send bloodGroup for better matches
        })
      });
      const data = await res.json();
      setMatchResults(prev => ({ ...prev, [alert._id]: { loading: false, data } }));
    } catch (err) {
      setMatchResults(prev => ({ ...prev, [alert._id]: { loading: false, error: 'Match failed' } }));
    }
  };

  // Only show alerts from last 24h
  const filteredAlerts = activeAlerts.filter(a => (Date.now() - new Date(a.createdAt).getTime()) < 24*60*60*1000);
  
  // Separate into Feed (Others) and Mine (My Requests)
  const feedAlerts = filteredAlerts.filter(a => !user || (a.requesterId && a.requesterId._id !== user.id));
  const myAlerts = filteredAlerts.filter(a => user && a.requesterId && a.requesterId._id === user.id);

  const displayAlerts = activeTab === 'feed' ? feedAlerts : myAlerts;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#b71c1c] flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 animate-pulse" /> SOS Center
          </h1>
          <p className="text-slate-500 font-medium">Critical emergencies needing immediate response.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => setActiveTab('feed')} 
          className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'feed' ? 'bg-[#b71c1c] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          Live Emergencies ({feedAlerts.length})
        </button>
        {user && (
          <button 
            onClick={() => setActiveTab('mine')} 
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'mine' ? 'bg-[#b71c1c] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            My Requests ({myAlerts.length})
          </button>
        )}
      </div>
      
      {/* List */}
      <div className="space-y-6">
        {displayAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
            No alerts here right now.
          </div>
        ) : (
          displayAlerts.map(alert => {
            const isAcceptedByUser = user && alert.acceptedBy?.some(u => u._id === user.id);
            const isOwnAlert = activeTab === 'mine';

            return (
              <div key={alert._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className={`h-1.5 w-full ${alert.urgency === 'critical' ? 'bg-red-600' : 'bg-orange-500'}`}></div>
                
                <div className="p-6">
                  {/* Alert Header */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">{alert.urgency}</span>
                        <span className="text-xs text-slate-400">{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">
                        {alert.resourceType === 'blood' && alert.bloodGroup ? `Needed: ${alert.bloodGroup} Blood` : `Needed: ${alert.resourceType.toUpperCase()}`}
                      </h2>
                    </div>
                    {alert.resourceType === 'blood' ? <Droplet className="w-8 h-8 text-red-500" /> : <Activity className="w-8 h-8 text-blue-500" />}
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Patient Info</p>
                      <p className="font-bold text-slate-700">{alert.patientName || alert.guestName || alert.requesterId?.name || 'Unknown Patient'}</p>
                      <p className="text-sm text-slate-500">{alert.hospitalName || alert.location?.address || 'Location Not Specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Contact</p>
                      <p className="font-bold text-slate-700">{alert.contactName || alert.guestName || alert.requesterId?.name || 'Not Provided'}</p>
                      {alert.contactPhone || alert.guestContact || alert.requesterId?.contactNumber ? (
                         <a href={`tel:${alert.contactPhone || alert.guestContact || alert.requesterId?.contactNumber}`} className="text-sm font-bold text-blue-600">
                           {alert.contactPhone || alert.guestContact || alert.requesterId?.contactNumber}
                         </a>
                      ) : (
                         <span className="text-sm text-slate-400">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Extra Details */}
                  {alert.details && (
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg mb-4 text-sm text-amber-900">
                      <span className="font-bold text-amber-800">Note: </span> {alert.details}
                    </div>
                  )}

                  {/* Compatibility Info */}
                  {alert.resourceType === 'blood' && alert.bloodGroup && (
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4 text-sm text-blue-900 flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-bold text-blue-800">Who can help? </span> 
                        Compatible Donors: <span className="font-black bg-blue-200 px-2 rounded">{getCompatibleDonors(alert.bloodGroup)}</span>
                      </div>
                    </div>
                  )}

                  {/* Responded Donors (Visible only to Requester) */}
                  {isOwnAlert && alert.acceptedBy?.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                      <h3 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                        <HeartHandshake className="w-5 h-5"/> Helpers On The Way!
                      </h3>
                      <div className="space-y-3">
                        {alert.acceptedBy.map((donor, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-green-100 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800">{donor.name} <span className="text-red-500 text-sm">({donor.bloodGroup})</span></p>
                              <a href={`tel:${donor.contactNumber}`} className="text-sm font-bold text-blue-600 flex items-center gap-1"><Phone className="w-3 h-3"/> Call {donor.contactNumber}</a>
                            </div>
                            {/* Live tracking: Google maps link to donor's live location if available */}
                            {liveDonorLocations[donor._id] ? (
                              <a href={`https://www.google.com/maps?q=${liveDonorLocations[donor._id].lat},${liveDonorLocations[donor._id].lng}`} target="_blank" rel="noreferrer" className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1 animate-pulse">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span> Live Track
                              </a>
                            ) : (
                              <a href={`https://www.google.com/maps?q=${donor.location?.lat},${donor.location?.lng}`} target="_blank" rel="noreferrer" className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                <MapPin className="w-3 h-3"/> Location
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                    <a href={`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`} target="_blank" rel="noreferrer" className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-lg font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Map
                    </a>
                    
                    {/* Helper View Actions */}
                    {!isOwnAlert && user?.role === 'donor' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptAlert(alert._id)} disabled={isAcceptedByUser || acceptingId === alert._id} className={`py-2.5 px-6 rounded-lg font-black flex items-center gap-2 ${isAcceptedByUser ? 'bg-green-100 text-green-700' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                          {isAcceptedByUser ? <><CheckCircle className="w-4 h-4"/> I'm Helping</> : <><Droplet className="w-4 h-4"/> I Will Help</>}
                        </button>
                        {isAcceptedByUser && (
                           <>
                             <button 
                               onClick={() => {
                                 if (navigator.geolocation) {
                                   toast.success("Live location sharing started!");
                                   navigator.geolocation.watchPosition(
                                     (pos) => {
                                       socket.emit('track_donor', { 
                                         alertId: alert._id, 
                                         donorId: user.id, 
                                         lat: pos.coords.latitude, 
                                         lng: pos.coords.longitude 
                                       });
                                     },
                                     (err) => toast.error("Location permission denied"),
                                     { enableHighAccuracy: true }
                                   );
                                 } else {
                                   toast.error("Geolocation not supported");
                                 }
                               }}
                               className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-bold flex items-center gap-2 animate-pulse"
                             >
                               <MapPin className="w-4 h-4"/> Share Live Location
                             </button>
                             <button
                               onClick={() => handleWithdrawAlert(alert._id)}
                               disabled={acceptingId === alert._id}
                               className="bg-red-50 hover:bg-red-100 text-red-600 py-2.5 px-4 rounded-lg font-bold flex items-center gap-2 border border-red-200"
                             >
                               Undo
                             </button>
                           </>
                        )}
                      </div>
                    )}

                    {/* Requester View Actions */}
                    {isOwnAlert && (
                      <>
                        <button onClick={() => handleMatch(alert)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg font-bold flex items-center gap-2">
                          <Activity className="w-4 h-4"/> AI Match Donors
                        </button>
                        <button onClick={() => handleResolveAlert(alert._id)} className="bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-bold flex items-center gap-2 ml-auto">
                          <CheckCircle className="w-4 h-4"/> Close Request
                        </button>
                      </>
                    )}
                  </div>

                  {/* AI Match Results (Only for Requester) */}
                  {isOwnAlert && matchResults[alert._id] && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      {matchResults[alert._id].loading ? (
                        <p className="text-blue-600 font-bold flex items-center gap-2"><Activity className="w-4 h-4 animate-spin"/> Finding matches...</p>
                      ) : matchResults[alert._id].data && matchResults[alert._id].data.bestHospitals ? (
                        <div>
                          <p className="font-bold text-slate-800 mb-2">AI Suggestions:</p>
                          <ul className="space-y-2 mb-3">
                            {matchResults[alert._id].data.bestHospitals.map((h, i) => (
                              <li key={i} className="bg-white p-2 rounded border border-slate-200 text-sm">
                                <span className="font-bold">{h.hospitalName}</span> - {h.availableResource} (📞 <a href={`tel:${h.contact}`} className="text-blue-600 font-bold">{h.contact}</a>)
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs font-medium text-slate-600 bg-white/50 p-2 rounded">{matchResults[alert._id].data.aiAdvice}</p>
                        </div>
                      ) : (
                        <p className="text-red-500">Could not fetch AI match: {matchResults[alert._id].data?.error || 'Unknown error'}.</p>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
