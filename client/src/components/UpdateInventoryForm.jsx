import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export default function UpdateInventoryForm({ onClose }) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    hospitalId: user ? user.id : null,
    resourceType: (user?.role === 'donor') ? 'medicine' : 'blood',
    name: (user?.role === 'donor') ? 'Paracetamol' : 'O- Blood',
    actionType: 'add',
    amount: 0,
    unit: 'units'
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to update inventory');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        hospitalId: user.id,
        resourceType: formData.resourceType,
        name: formData.name,
        quantityChange: formData.actionType === 'add' ? Number(formData.amount) : -Number(formData.amount),
        unit: formData.unit
      };

      const response = await fetch(`${API_BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        toast.success('Inventory updated successfully!');
        onClose();
      } else {
        toast.error('Failed to update inventory');
      }
    } catch (error) {
      toast.error('Error submitting inventory');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Update Inventory</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resource Type</label>
            <select name="resourceType" value={formData.resourceType} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-bloodRed focus:border-bloodRed">
              {user?.role !== 'donor' && <option value="blood">Blood</option>}
              <option value="medicine">Medicine</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resource Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-bloodRed focus:border-bloodRed" placeholder="e.g. Paracetamol or AB+ Blood" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="actionType" value="add" checked={formData.actionType === 'add'} onChange={handleChange} className="text-bloodRed focus:ring-bloodRed" />
                <span className="text-sm font-medium text-slate-700">(+) Add to Stock</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="actionType" value="deduct" checked={formData.actionType === 'deduct'} onChange={handleChange} className="text-bloodRed focus:ring-bloodRed" />
                <span className="text-sm font-medium text-slate-700">(-) Remove</span>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Update</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-bloodRed focus:border-bloodRed" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <input type="text" name="unit" value={formData.unit} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-bloodRed focus:border-bloodRed" placeholder="e.g. pints, strips" required />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-bloodRed text-white font-medium hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
