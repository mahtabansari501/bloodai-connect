import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import UpdateInventoryForm from '../components/UpdateInventoryForm';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Plus, Activity, Droplet, Pill, Building2, 
  MapPin, Clock, Sparkles, AlertTriangle, CheckCircle, Info, Star, Users, Database
} from 'lucide-react';
import { API_BASE_URL, SOCKET_URL } from '../config';

const socket = io(SOCKET_URL);

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'hospital', 'organization', 'donor'
  const [showModal, setShowModal] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const { user } = useAuth();

  const fetchPrediction = () => {
    fetch(`${API_BASE_URL}/api/predict/inventory`, {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => setAiPrediction(data))
      .catch(err => setAiPrediction({ status: 'Error', recommendation: 'AI service unavailable.' }));
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/inventory`, {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => {
        setInventory(data);
        fetchPrediction();
      })
      .catch(err => console.error(err));

    socket.on('inventory_update', (data) => {
      setInventory(data);
      fetchPrediction();
    });

    return () => {
      socket.off('inventory_update');
    };
  }, []);

  const filteredInventory = useMemo(() => {
    if (!Array.isArray(inventory)) return [];
    
    return inventory.filter(item => {
      if (item.quantity <= 0) return false;
      
      // Match Search Query (by item name, hospital name, or specific blood group/medicine)
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.name.toLowerCase().includes(q) || 
        item.resourceType.toLowerCase().includes(q) ||
        (item.hospitalId?.name || '').toLowerCase().includes(q);
        
      if (!matchesSearch) return false;

      // Match Source Type
      if (sourceFilter !== 'all') {
        const itemRole = item.hospitalId?.role || 'donor';
        if (sourceFilter === 'hospital' && itemRole !== 'hospital') return false;
        if (sourceFilter === 'organization' && !['organization', 'pharmacy'].includes(itemRole)) return false;
        if (sourceFilter === 'donor' && itemRole !== 'donor') return false;
      }

      return true;
    });
  }, [inventory, searchQuery, sourceFilter]);

  const totalBlood = Array.isArray(inventory) ? inventory.filter(i => i.resourceType === 'blood').reduce((a, b) => a + b.quantity, 0) : 0;
  const totalMed = Array.isArray(inventory) ? inventory.filter(i => i.resourceType !== 'blood').reduce((a, b) => a + b.quantity, 0) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-wider mb-3">
            <Activity size={14} /> Live Resource Network
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-br from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
            Inventory Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium max-w-xl">
            Real-time availability of life-saving resources from verified partners and donors.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {user && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 md:flex-none justify-center bg-gradient-to-r from-[#b71c1c] to-[#d32f2f] hover:from-[#8e0000] hover:to-[#b71c1c] text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Plus size={20} /> Update Inventory
            </button>
          )}
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Stats & AI) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              <Droplet className="text-[#b71c1c] w-10 h-10 mb-3 relative z-10" />
              <h3 className="text-3xl font-black text-slate-800 relative z-10">{totalBlood}</h3>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider relative z-10">Blood Units</p>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              <Pill className="text-blue-500 w-10 h-10 mb-3 relative z-10" />
              <h3 className="text-3xl font-black text-slate-800 relative z-10">{totalMed}</h3>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider relative z-10">Medical Items</p>
            </div>
          </div>

          {/* AI Prediction Widget */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/30 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 group-hover:bg-purple-500/30 transition-all duration-700"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="text-blue-400 animate-pulse" size={24} /> 
                <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">AI Supply Insights</span>
              </h2>
              
              {!aiPrediction ? (
                <div className="flex flex-col justify-center items-center h-32 opacity-70">
                  <Activity className="w-8 h-8 animate-spin text-blue-400 mb-2" />
                  <p className="text-sm font-medium">Analyzing network data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl flex items-start gap-3 backdrop-blur-md border ${
                    aiPrediction.status === 'Critical' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 
                    aiPrediction.status === 'Warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' : 
                    'bg-green-500/10 border-green-500/20 text-green-200'
                  }`}>
                    {aiPrediction.status === 'Critical' ? <AlertTriangle className="shrink-0 mt-0.5 text-red-400" size={20} /> :
                     aiPrediction.status === 'Warning' ? <AlertTriangle className="shrink-0 mt-0.5 text-yellow-400" size={20} /> :
                     <CheckCircle className="shrink-0 mt-0.5 text-green-400" size={20} />}
                    <div>
                      <p className="font-bold text-sm tracking-wide uppercase mb-1 opacity-80">Network Status</p>
                      <p className="font-black text-lg">{aiPrediction.status}</p>
                    </div>
                  </div>

                  {aiPrediction.shortages && aiPrediction.shortages.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Identified Shortages</p>
                      <div className="flex flex-wrap gap-2">
                        {aiPrediction.shortages.map((item, idx) => (
                          <span key={idx} className="bg-red-500/20 text-red-200 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">AI Recommendation</p>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed">{aiPrediction.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Inventory List & Filters) */}
        <div className="lg:col-span-2 flex flex-col h-[800px]">
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full overflow-hidden">
            
            {/* Search & Filter Bar */}
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4 z-10 relative">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search specific blood group (e.g. O+) or medicine..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <FilterChip label="All Sources" active={sourceFilter === 'all'} onClick={() => setSourceFilter('all')} icon={<Database size={14}/>} />
                <FilterChip label="Hospitals" active={sourceFilter === 'hospital'} onClick={() => setSourceFilter('hospital')} icon={<Building2 size={14}/>} />
                <FilterChip label="Organizations" active={sourceFilter === 'organization'} onClick={() => setSourceFilter('organization')} icon={<Users size={14}/>} />
                <FilterChip label="Individuals" active={sourceFilter === 'donor'} onClick={() => setSourceFilter('donor')} icon={<Sparkles size={14}/>} />
              </div>
            </div>

            {/* Inventory Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/30">
              {(!Array.isArray(inventory) || inventory.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Database size={64} className="mb-4 opacity-20" />
                  <p className="text-xl font-bold">No Inventory Found</p>
                  <p className="text-sm mt-2">The hospital network currently has no data available.</p>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Search size={64} className="mb-4 opacity-20" />
                  <p className="text-xl font-bold">No Matches</p>
                  <p className="text-sm mt-2">Try adjusting your search query or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredInventory.map(item => (
                    <ResourceCard key={item._id} item={item} />
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
      
      {showModal && <UpdateInventoryForm onClose={() => setShowModal(false)} />}
    </div>
  );
}

function FilterChip({ label, active, onClick, icon }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
        active 
        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function ResourceCard({ item }) {
  const isBlood = item.resourceType === 'blood';
  const hospital = item.hospitalId;
  const rating = hospital?.rating || 5.0;
  
  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-lg transition-all group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
              isBlood ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {item.resourceType}
            </span>
          </div>
          <h4 className="text-xl font-black text-slate-800 tracking-tight">{item.name}</h4>
        </div>
        <div className={`flex items-baseline gap-1 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 ${
          item.quantity <= 5 ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-slate-800'
        }`}>
          <span className="text-2xl font-black">{item.quantity}</span>
          <span className="text-sm font-bold opacity-70">{item.unit}</span>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-lg ${hospital?.role === 'donor' ? 'bg-purple-50 text-purple-600' : hospital?.role === 'hospital' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
              {hospital?.role === 'donor' ? <Sparkles size={16} /> : hospital?.role === 'hospital' ? <Building2 size={16} /> : <Users size={16} />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 line-clamp-1">
                {hospital ? (
                  <Link to={`/profile/${hospital._id}`} className="hover:text-blue-600 transition-colors">
                    {hospital.name}
                  </Link>
                ) : 'Unknown Source'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-slate-600">{rating.toFixed(1)}</span>
                <span className="text-[10px] font-medium text-slate-400 capitalize px-1.5 py-0.5 bg-slate-100 rounded ml-1">
                  {hospital?.role || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Updated {new Date(item.lastUpdated).toLocaleDateString()}
          </span>
          {hospital?.contactNumber && (
            <span className="text-slate-500 font-bold">📞 {hospital.contactNumber}</span>
          )}
        </div>
      </div>
    </div>
  );
}
