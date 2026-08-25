import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export default function CreateCampModal({ onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizerName: user ? user.name : '',
    contactNumber: user?.contactNumber || '',
    date: '',
    address: '',
    details: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to organize a camp');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/camps`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ ...formData, organizerId: user.id })
      });
      
      if (response.ok) {
        toast.success('Blood camp created successfully!');
        onClose();
      } else {
        toast.error('Failed to create camp');
      }
    } catch (error) {
      toast.error('Error submitting camp details');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Organize Blood Camp ⛺</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organizer Name</label>
              <input type="text" name="organizerName" value={formData.organizerName} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-bloodRed focus:border-bloodRed" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-bloodRed focus:border-bloodRed" required />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Camp Date & Time</label>
            <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-bloodRed focus:border-bloodRed" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Address / Location</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g. Community Hall, MG Road, Mumbai" className="w-full rounded-lg border-slate-300 border p-2 focus:ring-bloodRed focus:border-bloodRed" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Details (Optional)</label>
            <textarea name="details" value={formData.details} onChange={handleChange} rows="3" className="w-full rounded-lg border-slate-300 border p-2 focus:ring-bloodRed focus:border-bloodRed" placeholder="Any specific requirements or instructions for donors?"></textarea>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-bloodRed text-white font-medium hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {loading ? 'Submitting...' : 'Announce Camp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
