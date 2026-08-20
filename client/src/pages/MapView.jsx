import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { API_BASE_URL, SOCKET_URL } from '../config';

const socket = io(SOCKET_URL);

export default function MapView() {
  const [alerts, setAlerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Location error:", error);
          setUserLocation([51.505, -0.09]); // Default fallback
        }
      );
    } else {
      setUserLocation([51.505, -0.09]);
    }

    // Fetch initial active alerts
    fetch(`${API_BASE_URL}/api/sos`)
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error(err));

    // Listen for new alerts via WebSockets
    socket.on('new_sos_alert', (newAlert) => {
      setAlerts(prev => [...prev, newAlert]);
    });

    return () => {
      socket.off('new_sos_alert');
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Live Map</h1>
        <p className="text-slate-500 mt-1">Real-time view of SOS alerts and nearby medical resources.</p>
      </header>
      
      <div className="flex-grow bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative z-0">
        {!userLocation ? (
          <div className="flex items-center justify-center h-full w-full bg-slate-50 text-slate-500 font-medium">
            Fetching your location...
          </div>
        ) : (
          <MapContainer center={userLocation} zoom={13} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {alerts.map(alert => (
              <Marker key={alert._id} position={[alert.location.lat, alert.location.lng]}>
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <div className="font-bold text-red-600 mb-1 flex justify-between items-center">
                      <span>SOS: {alert.resourceType.toUpperCase()}</span>
                      <span className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{alert.details}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Requester: {alert.requesterId?.name || 'Unknown'} <br/>
                      Contact: {alert.requesterId?.contactNumber || 'N/A'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
