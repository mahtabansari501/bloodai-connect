import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, MapPin, Droplet, User as UserIcon, LogOut, Activity, Share2, Database, CheckCircle, Heart, HeartHandshake, Calendar, Edit2, Building2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ contactNumber: '', bloodGroup: '', address: '' });
  
  const isOwnProfile = !id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = id ? `${API_BASE_URL}/api/auth/user/${id}` : `${API_BASE_URL}/api/auth/me`;
        const res = await fetch(url, {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          toast.error("Failed to load profile");
        }
      } catch (err) {
        toast.error("Error loading profile");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/profile/${profile._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `BloodAI Profile - ${profile.name}`,
          text: `Check out ${profile.name}'s profile on BloodAI Connect`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Profile link copied to clipboard!");
    }
  };

  const handleToggleAvailable = async (e) => {
    if (!isOwnProfile) return;
    const isAvailable = e.target.checked;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ isAvailable })
      });
      if (res.ok) {
        setProfile(prev => ({ ...prev, isAvailable }));
        toast.success(isAvailable ? "Status updated to Available" : "Status updated to Unavailable");
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(prev => ({ ...prev, contactNumber: updated.contactNumber, bloodGroup: updated.bloodGroup, location: updated.location }));
        toast.success("Profile updated!");
        setIsEditOpen(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("Error updating profile");
    }
    setLoading(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setUploading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/auth/me/avatar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ avatar: base64String })
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(prev => ({ ...prev, avatar: data.avatar }));
          toast.success('Profile photo updated!');
        } else {
          toast.error('Failed to update photo');
        }
      } catch (err) {
        toast.error('Error updating photo');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b71c1c]"></div>
      </div>
    );
  }

  if (!profile) return null;

  const role = profile.role || 'donor';
  const isDonor = role === 'donor';
  const isHospital = role === 'hospital';
  const isOrg = role === 'organization' || role === 'pharmacy';

  // Real Journey Data (fallback to empty array if none exists)
  const journey = profile.journey || [];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 relative">
        
        {/* Banner Section */}
        <div 
          className="h-48 md:h-56 bg-gradient-to-r from-[#8e0000] via-[#b71c1c] to-[#d32f2f] relative"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-50,50 Q100,150 250,50 T550,150' fill='none' stroke='white' stroke-width='2' stroke-opacity='0.15'/%3E%3Cpath d='M-50,200 Q150,50 300,200 T600,100' fill='none' stroke='white' stroke-width='1.5' stroke-opacity='0.1'/%3E%3Cpath d='M-50,400 Q100,500 250,350 T600,450' fill='none' stroke='white' stroke-width='2' stroke-opacity='0.1'/%3E%3C/svg%3E"), linear-gradient(180deg, #8e0000 0%, #b71c1c 100%)`,
            backgroundSize: 'cover'
          }}
        >
          {/* Logo or Text in top left */}
          <div className="absolute top-6 left-6 text-white/90 font-bold flex items-center gap-2">
            <Droplet className="w-6 h-6 fill-white text-white" />
            <span className="text-xl tracking-tight">BloodAI</span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 md:px-12 pb-12 relative">
          {/* Avatar Section */}
          <div className="flex flex-col items-center -mt-24 mb-6">
            <div className="relative group">
              <div className="w-40 h-40 bg-white rounded-full p-2 shadow-xl">
                <div 
                  className="w-full h-full rounded-full border-4 border-slate-50 bg-slate-100 flex items-center justify-center overflow-hidden"
                  style={{ backgroundImage: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}
                >
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setIsPhotoOpen(true)}
                    />
                  ) : isHospital ? (
                    <Building2 size={64} className="text-slate-400" />
                  ) : isOrg ? (
                    <Users size={64} className="text-slate-400" />
                  ) : (
                    <UserIcon size={64} className="text-slate-400" />
                  )}
                </div>
              </div>
              
              {/* Circular Border Accent */}
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 border-l-[#b71c1c] rotate-45 pointer-events-none scale-105"></div>

              {isOwnProfile && (
                <label className="absolute bottom-2 right-2 bg-white text-slate-700 p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100 z-10 flex items-center justify-center">
                  <Edit2 size={16} className="text-slate-600" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
                </label>
              )}
            </div>
            
            <h1 className="text-3xl font-black text-slate-800 mt-4 capitalize tracking-tight">{profile.name}</h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">{profile.email}</p>
            
            <div className="flex items-center gap-1.5 mt-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Verified {role}</span>
            </div>

            {isDonor && profile.bloodGroup && (
              <div className="flex items-center gap-2 mt-3 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                <span className="text-sm font-bold text-green-700">Blood Type {profile.bloodGroup}</span>
                <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full">(Verified)</span>
                <Droplet className="w-4 h-4 fill-red-500 text-red-500 ml-1" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 flex-wrap mb-10">
            <a href="tel:18001234567" className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition-all">
              <Phone className="w-4 h-4 text-red-500" /> Call Support
            </a>
            <button onClick={handleShare} className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition-all">
              <Share2 className="w-4 h-4 text-blue-500" /> Share Profile
            </button>
            {isOwnProfile && (
              <button 
                onClick={() => {
                  setEditForm({ contactNumber: profile.contactNumber || '', bloodGroup: profile.bloodGroup || '', address: profile.location?.address || '' });
                  setIsEditOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border-none bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm shadow-sm transition-all"
              >
                <UserIcon className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {/* Dynamic Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {isDonor && (
              <>
                <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-5 flex items-center justify-center gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-5"><Droplet className="w-32 h-32" /></div>
                  <div className="text-center relative z-10">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Type {profile.bloodGroup || 'N/A'}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">(Verified)</p>
                  </div>
                </div>
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 flex items-center justify-center gap-4 relative overflow-hidden">
                  <Heart className="w-10 h-10 text-red-500 fill-red-500/20" />
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-slate-800">{profile.stats?.donated || 0}</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Donated</p>
                  </div>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex items-center justify-center gap-4 relative overflow-hidden">
                  <HeartHandshake className="w-10 h-10 text-blue-600" />
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-slate-800">{profile.stats?.requested || 0}</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Requested</p>
                  </div>
                </div>
              </>
            )}
            
            {isHospital && (
              <>
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex items-center justify-center gap-4">
                  <Activity className="w-10 h-10 text-orange-500" />
                  <div>
                    <h3 className="text-3xl font-black text-slate-800">{profile.stats?.sosResolved || 0}</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">SOS Handled</p>
                  </div>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex items-center justify-center gap-4">
                  <Database className="w-10 h-10 text-blue-600" />
                  <div>
                    <h3 className="text-3xl font-black text-slate-800">{profile.stats?.inventoryItems || 0}</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">In Stock</p>
                  </div>
                </div>
                <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 flex items-center justify-center gap-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                  <div>
                    <h3 className="text-3xl font-black text-slate-800">Active</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Status</p>
                  </div>
                </div>
              </>
            )}

            {isOrg && (
              <>
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 flex items-center justify-center gap-4">
                  <Calendar className="w-10 h-10 text-purple-500" />
                  <div>
                    <h3 className="text-3xl font-black text-slate-800">{profile.stats?.camps || 0}</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Camps Hosted</p>
                  </div>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex items-center justify-center gap-4">
                  <Users className="w-10 h-10 text-blue-600" />
                  <div>
                    <h3 className="text-3xl font-black text-slate-800">{profile.stats?.donors || 0}</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Donors Reached</p>
                  </div>
                </div>
                <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 flex items-center justify-center gap-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                  <div>
                    <h3 className="text-3xl font-black text-slate-800">Active</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Status</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Grid: Timeline & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Timeline */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-black text-slate-800 mb-6">
                {isDonor ? 'Donation Journey' : isHospital ? 'Recent Alerts' : 'Recent Camps'}
              </h3>
              <div className="relative pl-3 border-l-2 border-slate-100 space-y-6">
                {journey.length > 0 ? (
                  journey.map((item, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className={`absolute -left-[35px] top-0 p-2 rounded-full border-4 border-white ${item.bg}`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{item.date}</p>
                      <p className="text-sm text-slate-500 font-medium">at {item.title}</p>
                    </div>
                  ))
                ) : (
                  <div className="relative pl-6 pt-2">
                    <div className="absolute -left-[35px] top-2 p-2 rounded-full border-4 border-white bg-slate-100">
                      <Heart className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">No records yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Your journey will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Info Cards */}
            <div className="lg:col-span-2 space-y-3">
              {isOwnProfile && (
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2.5 rounded-lg text-green-600">
                      {isDonor ? <Droplet size={20} /> : <Activity size={20} />}
                    </div>
                    <span className="font-bold text-slate-700">{isDonor ? 'Available to Donate' : 'Accepting Emergencies'}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={profile.isAvailable !== false} onChange={handleToggleAvailable} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              )}

              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                    <Phone size={20} />
                  </div>
                  <span className="font-bold text-slate-700">Contact Number</span>
                </div>
                <span className="text-slate-600 font-bold">{profile.contactNumber || 'Not provided'}</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600">
                    <MapPin size={20} />
                  </div>
                  <span className="font-bold text-slate-700">Location</span>
                </div>
                <span className="text-slate-600 font-bold text-right truncate max-w-[50%]">
                  {profile.location?.address || 'Not provided'}
                </span>
              </div>

              {isOwnProfile && (
                <div className="pt-4">
                  <button onClick={handleLogout} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm transition-all shadow-sm">
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Photo Zoom Modal */}
      {isPhotoOpen && profile.avatar && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200"
          onClick={() => setIsPhotoOpen(false)}
        >
          <div className="relative max-w-2xl w-full h-auto flex flex-col items-center">
            <button 
              onClick={() => setIsPhotoOpen(false)}
              className="absolute -top-12 right-0 md:-right-12 text-white bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-colors"
            >
              <LogOut size={24} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <img 
              src={profile.avatar} 
              alt="Enlarged Profile" 
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {isDonor && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Blood Group</label>
                  <select 
                    value={editForm.bloodGroup} 
                    onChange={e => setEditForm({...editForm, bloodGroup: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-[#f8fafc] focus:outline-none focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)] font-medium text-slate-700 transition-all"
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Contact Number</label>
                <input 
                  type="text" 
                  value={editForm.contactNumber} 
                  onChange={e => setEditForm({...editForm, contactNumber: e.target.value})}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-[#f8fafc] focus:outline-none focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)] font-medium text-slate-700 transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Location (Address)</label>
                <input 
                  type="text" 
                  value={editForm.address} 
                  onChange={e => setEditForm({...editForm, address: e.target.value})}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-[#f8fafc] focus:outline-none focus:bg-white focus:border-[#b71c1c]/30 focus:shadow-[0_0_0_3px_rgba(183,28,28,0.1)] font-medium text-slate-700 transition-all"
                  placeholder="Your address"
                />
              </div>
              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#b71c1c] hover:bg-[#8e0000] shadow-lg shadow-red-900/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
