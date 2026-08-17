import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import { MapPin, AlertTriangle, User, Phone, Building2, Droplet, Activity, Info } from 'lucide-react';

export default function EmergencySOSModal({ onClose }) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    requesterId: user ? user.id : null,
    patientName: '',
    hospitalName: '',
    bloodGroup: '',
    unitsRequired: 1,
    contactName: user ? user.name : '',
    contactPhone: user ? user.contactNumber : '',
    resourceType: 'blood',
    details: '',
    urgency: 'critical',
    location: { lat: 0, lng: 0, address: '' }
  });
  
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('pending'); // 'pending' | 'fetching' | 'success' | 'error'

  const getLocation = () => {
    setLocationStatus('fetching');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, lat: position.coords.latitude, lng: position.coords.longitude }
          }));
          setLocationStatus('success');
        },
        (error) => {
          console.error("Error fetching location", error);
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contactName || !formData.contactPhone) {
      toast.error('Please provide a contact person and number');
      return;
    }
    if (locationStatus !== 'success') {
      toast.error('Please allow location access to create an SOS alert.');
      return;
    }
    if (formData.resourceType === 'blood' && !formData.bloodGroup) {
      toast.error('Please specify the required Blood Group');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!user) delete payload.requesterId;
      
      const response = await fetch(`${API_BASE_URL}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        toast.success('Emergency Broadcasted Successfully!');
        onClose();
      } else {
        toast.error('Failed to broadcast SOS');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-red-950/80 backdrop-blur-sm flex items-center justify-center z-[999] p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-t-8 border-[#b71c1c]">
        {/* Header */}
        <div className="bg-red-50 p-6 flex justify-between items-start border-b border-red-100">
          <div>
            <h2 className="text-3xl font-black text-[#b71c1c] flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 animate-pulse" /> Emergency SOS
            </h2>
            <p className="text-red-700 font-medium mt-1">Broadcast an immediate alert to nearby donors</p>
          </div>
          <button onClick={onClose} className="bg-white p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-100 transition-all shadow-sm">✕</button>
        </div>
        
        {/* Form Body */}
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Resource Type & Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-500"/> Required Resource</label>
                <select name="resourceType" value={formData.resourceType} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none font-medium text-slate-700">
                  <option value="blood">Blood</option>
                  <option value="medicine">Medicine</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-500"/> Urgency Level</label>
                <select name="urgency" value={formData.urgency} onChange={handleChange} className="w-full rounded-xl border border-red-200 p-3 bg-red-50 focus:ring-2 focus:ring-red-200 outline-none font-bold text-red-700">
                  <option value="critical">CRITICAL (Immediate)</option>
                  <option value="high">HIGH (Within 12 hrs)</option>
                  <option value="medium">MEDIUM (Within 24 hrs)</option>
                </select>
              </div>
            </div>

            {/* Blood Specifics (Conditionally rendered) */}
            {formData.resourceType === 'blood' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Droplet className="w-4 h-4 text-red-500"/> Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 focus:border-red-500 outline-none font-black text-slate-700">
                    <option value="">Select Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Units Required</label>
                  <input type="number" min="1" max="20" name="unitsRequired" value={formData.unitsRequired} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 focus:border-red-500 outline-none font-black text-slate-700" required />
                </div>
              </div>
            )}

            {/* Patient & Hospital Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400"/> Patient Name</label>
                <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 focus:border-red-500 outline-none text-slate-700 font-medium" placeholder="Patient's full name" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400"/> Hospital/Clinic Name</label>
                <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 focus:border-red-500 outline-none text-slate-700 font-medium" placeholder="Where is the patient admitted?" required />
              </div>
            </div>

            {/* Contact Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><User className="w-4 h-4 text-green-500"/> Contact Person (You)</label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 focus:border-red-500 outline-none text-slate-700 font-medium" placeholder="Your name" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Phone className="w-4 h-4 text-green-500"/> Contact Phone</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 focus:border-red-500 outline-none text-slate-700 font-medium" placeholder="10-digit number" required />
              </div>
            </div>
            
            {/* Additional Details */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Info className="w-4 h-4 text-slate-400"/> Additional Details (Optional)</label>
              <textarea name="details" value={formData.details} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 focus:border-red-500 outline-none text-slate-700 resize-none" placeholder="E.g., Require platelets immediately..." rows="2"></textarea>
            </div>
            
            {/* Location */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500"/> Live Location Verification</label>
              {locationStatus === 'success' ? (
                <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-bold flex items-center gap-3">
                  <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                  Location captured and verified.
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={getLocation} 
                  className={`w-full font-bold py-3.5 rounded-xl border transition-all flex justify-center items-center gap-2 ${
                    locationStatus === 'fetching' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm'
                  }`}
                >
                  {locationStatus === 'fetching' ? (
                    <><Activity className="w-5 h-5 animate-spin"/> Acquiring GPS...</>
                  ) : (
                    <><MapPin className="w-5 h-5"/> Tap to share Current Location</>
                  )}
                </button>
              )}
              {locationStatus === 'error' && <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Failed to get location. Please allow location access in your browser.</p>}
            </div>
            
            {/* Actions */}
            <div className="pt-2 flex justify-end gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={loading || locationStatus !== 'success'} className="flex-1 max-w-xs px-6 py-3.5 bg-[#b71c1c] hover:bg-[#8e0000] text-white font-black text-lg rounded-xl transition-all shadow-[0_8px_20px_-8px_rgba(183,28,28,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:hover:translate-y-0 flex justify-center items-center gap-2">
                {loading ? 'Broadcasting...' : <><Activity className="w-5 h-5"/> BROADCAST SOS</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
