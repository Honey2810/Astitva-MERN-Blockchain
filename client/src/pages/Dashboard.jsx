import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  issueBirthCertificate, 
  issueDeathCertificate, 
  getBirthCertificates, 
  getDeathCertificates, 
  getSystemStats,
  getBlocks
} from '../services/certificateService';
import { 
  ShieldCheck, LogOut, LayoutDashboard, FilePlus2, ShieldAlert, 
  History, Loader2, Calendar, MapPin, User, FileText, Copy, 
  CheckCircle, ShieldAlert as AlertIcon, Info, Users, Search, 
  Activity, Layers, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // Navigation tabs: 'overview' | 'birth' | 'death' | 'history'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [stats, setStats] = useState({ births: 0, deaths: 0, blocks: 0, blockchainHealthy: true });
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [birthLogs, setBirthLogs] = useState([]);
  const [deathLogs, setDeathLogs] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [apiError, setApiError] = useState('');

  // Form states
  const [birthForm, setBirthForm] = useState({
    childName: '', gender: 'Male', dob: '', placeOfBirth: '', fatherName: '', motherName: ''
  });
  const [deathForm, setDeathForm] = useState({
    deceasedName: '', gender: 'Male', dateOfDeath: '', placeOfDeath: '', causeOfDeath: '', age: '', relativeName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [minedResult, setMinedResult] = useState(null);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'birth' | 'death'

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoadingData(true);
    setApiError('');
    try {
      const statsRes = await getSystemStats();
      if (statsRes.success) setStats(statsRes.data);

      const blocksRes = await getBlocks();
      if (blocksRes.success) setRecentBlocks(blocksRes.data);

      const birthRes = await getBirthCertificates();
      if (birthRes.success) setBirthLogs(birthRes.data);

      const deathRes = await getDeathCertificates();
      if (deathRes.success) setDeathLogs(deathRes.data);
    } catch (err) {
      setApiError('API server offline or database connection failed. Please ensure backend is running.');
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const handleBirthSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    setMinedResult(null);

    try {
      const res = await issueBirthCertificate(birthForm);
      if (res.success) {
        setMinedResult({
          type: 'Birth Certificate',
          certificateId: res.data.certificate.certificateId,
          certificateHash: res.data.certificate.certificateHash,
          blockIndex: res.data.certificate.blockIndex,
          blockHash: res.data.blockHash,
          nonce: res.data.blockNonce,
          name: birthForm.childName
        });
        setBirthForm({ childName: '', gender: 'Male', dob: '', placeOfBirth: '', fatherName: '', motherName: '' });
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to issue Birth Certificate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeathSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    setMinedResult(null);

    try {
      const res = await issueDeathCertificate(deathForm);
      if (res.success) {
        setMinedResult({
          type: 'Death Certificate',
          certificateId: res.data.certificate.certificateId,
          certificateHash: res.data.certificate.certificateHash,
          blockIndex: res.data.certificate.blockIndex,
          blockHash: res.data.blockHash,
          nonce: res.data.blockNonce,
          name: deathForm.deceasedName
        });
        setDeathForm({ deceasedName: '', gender: 'Male', dateOfDeath: '', placeOfDeath: '', causeOfDeath: '', age: '', relativeName: '' });
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to issue Death Certificate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied hash code to clipboard!');
  };

  // Compile history logs based on search query & filter criteria
  const getFilteredLogs = () => {
    const combined = [];
    
    if (filterCategory === 'all' || filterCategory === 'birth') {
      birthLogs.forEach(log => {
        combined.push({
          ...log,
          type: 'birth',
          name: log.childName,
          date: log.dob
        });
      });
    }

    if (filterCategory === 'all' || filterCategory === 'death') {
      deathLogs.forEach(log => {
        combined.push({
          ...log,
          type: 'death',
          name: log.deceasedName,
          date: log.dateOfDeath
        });
      });
    }

    // Sort descending by index
    combined.sort((a, b) => b.blockIndex - a.blockIndex);

    // Apply search filter
    if (!searchQuery.trim()) return combined;
    const query = searchQuery.toLowerCase();
    return combined.filter(log => 
      log.name.toLowerCase().includes(query) ||
      log.certificateId.toLowerCase().includes(query) ||
      log.certificateHash.toLowerCase().includes(query)
    );
  };

  const filteredLogs = getFilteredLogs();

  // Draw comparative distribution stats values
  const totalCerts = stats.births + stats.deaths;
  const birthPercentage = totalCerts > 0 ? Math.round((stats.births / totalCerts) * 100) : 0;
  const deathPercentage = totalCerts > 0 ? Math.round((stats.deaths / totalCerts) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-500/10 p-2 rounded-lg border border-primary-500/30">
              <ShieldCheck className="h-6 w-6 text-primary-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Astitva<span className="text-primary-500">.</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 border-r border-slate-800 pr-4">
              <span className={`h-2 w-2 rounded-full ${stats.blockchainHealthy ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {user?.role} Mode
              </span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Global Error Notice Panel */}
      {apiError && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs px-4 py-3 flex items-center justify-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 border-b md:border-b-0 md:border-r border-slate-800/80 pb-4 md:pb-0 md:pr-6 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-fit md:w-full whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Console Overview
          </button>
          <button
            onClick={() => setActiveTab('birth')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-fit md:w-full whitespace-nowrap ${
              activeTab === 'birth' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <FilePlus2 className="h-4 w-4" />
            Issue Birth Certificate
          </button>
          <button
            onClick={() => setActiveTab('death')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-fit md:w-full whitespace-nowrap ${
              activeTab === 'death' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Issue Death Certificate
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-fit md:w-full whitespace-nowrap ${
              activeTab === 'history' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <History className="h-4 w-4" />
            Ledger History
          </button>
        </aside>

        {/* Right Tab Content Window */}
        <main className="flex-grow w-full">
          
          {/* SKELETON LOADER PANEL */}
          {loadingData && (
            <div className="space-y-6">
              <div className="h-28 bg-slate-900/60 rounded-2xl border border-slate-800/80 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-24 bg-slate-900/60 rounded-2xl border border-slate-800/80 animate-pulse"></div>
                <div className="h-24 bg-slate-900/60 rounded-2xl border border-slate-800/80 animate-pulse"></div>
                <div className="h-24 bg-slate-900/60 rounded-2xl border border-slate-800/80 animate-pulse"></div>
              </div>
              <div className="h-64 bg-slate-900/60 rounded-2xl border border-slate-800/80 animate-pulse"></div>
            </div>
          )}

          {!loadingData && (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  
                  {/* Greetings Section */}
                  <div className="bg-gradient-to-r from-primary-950/20 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Welcome, {user?.name}
                      </h1>
                      <p className="text-xs md:text-sm text-slate-400 mt-1 font-light">
                        Registrar Console Credentials Active &bull; {user?.email}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-xs flex items-center gap-2 ${
                      stats.blockchainHealthy ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                    }`}>
                      <ShieldCheck className="h-4 w-4" />
                      <span>{stats.blockchainHealthy ? 'Ledger Chain Healthy' : 'Chain Corruption Warning'}</span>
                    </div>
                  </div>

                  {/* Dynamic Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-primary-500/5 rounded-full blur-xl"></div>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Births Issued</span>
                      <div className="text-3xl font-black text-white mt-2 font-mono">{stats.births}</div>
                      <p className="text-[10px] text-slate-400 mt-1">Verified child records</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-primary-500/5 rounded-full blur-xl"></div>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Deaths Issued</span>
                      <div className="text-3xl font-black text-white mt-2 font-mono">{stats.deaths}</div>
                      <p className="text-[10px] text-slate-400 mt-1">Verified deceased records</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl"></div>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ledger Blocks Mined</span>
                      <div className="text-3xl font-black text-white mt-2 font-mono">{stats.blocks}</div>
                      <p className="text-[10px] text-slate-400 mt-1">Total cryptographic indices</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* SVG Charts Panel */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Activity className="h-4.5 w-4.5 text-primary-400" />
                        Registry Distribution Analytics
                      </h3>
                      
                      {totalCerts === 0 ? (
                        <p className="text-center py-10 text-xs text-slate-500">No records filed in ledger. Issue a certificate to view analytics.</p>
                      ) : (
                        <div className="space-y-6">
                          {/* Comparative visual bar */}
                          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                            <div className="bg-primary-500 h-full" style={{ width: `${birthPercentage}%` }} title={`Births: ${birthPercentage}%`}></div>
                            <div className="bg-indigo-500 h-full" style={{ width: `${deathPercentage}%` }} title={`Deaths: ${deathPercentage}%`}></div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-2 text-primary-400">
                              <span className="h-3 w-3 bg-primary-500 rounded"></span>
                              <span>Births ({birthPercentage}%)</span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-400">
                              <span className="h-3 w-3 bg-indigo-500 rounded"></span>
                              <span>Deaths ({deathPercentage}%)</span>
                            </div>
                          </div>

                          {/* Dynamic SVG Visual Representation */}
                          <div className="border border-slate-800/60 bg-slate-950/40 p-4 rounded-xl flex items-center justify-center">
                            <svg width="220" height="120" viewBox="0 0 220 120">
                              {/* Births bar */}
                              <rect x="50" y={100 - (birthPercentage * 0.8)} width="40" height={birthPercentage * 0.8} rx="4" fill="#0ea5e9" />
                              <text x="70" y="115" textAnchor="middle" fill="#94a3b8" fontSize="10">Births</text>
                              <text x="70" y={90 - (birthPercentage * 0.8)} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{stats.births}</text>
                              
                              {/* Deaths bar */}
                              <rect x="130" y={100 - (deathPercentage * 0.8)} width="40" height={deathPercentage * 0.8} rx="4" fill="#6366f1" />
                              <text x="150" y="115" textAnchor="middle" fill="#94a3b8" fontSize="10">Deaths</text>
                              <text x="150" y={90 - (deathPercentage * 0.8)} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{stats.deaths}</text>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Block Explorer Tracker */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Layers className="h-4.5 w-4.5 text-emerald-400" />
                        Live Block Explorer (Latest 10 Mined)
                      </h3>

                      {recentBlocks.length === 0 ? (
                        <p className="text-center py-10 text-xs text-slate-500">No blocks mined on ledger.</p>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {recentBlocks.map((block) => (
                            <div key={block._id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-[10px] font-mono">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-primary-500/10 text-primary-400 border border-primary-500/25 px-1.5 py-0.5 rounded font-sans font-bold">Block #{block.index}</span>
                                  <span className="text-slate-500 font-sans">{new Date(block.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-slate-400 text-[9px] break-all truncate max-w-[180px]">Hash: {block.hash}</div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`px-2 py-0.5 rounded font-sans uppercase text-[9px] font-semibold ${
                                  block.certificateType === 'birth' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 
                                  block.certificateType === 'death' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {block.certificateType}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: BIRTH CERTIFICATE FORM */}
              {activeTab === 'birth' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-white">Issue Birth Certificate</h2>
                    <p className="text-xs text-slate-400 mt-1 font-light">Create a tamper-proof digital birth record and link it to the blockchain ledger.</p>
                  </div>

                  {/* Submit Success Modal */}
                  {minedResult && (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-6 space-y-4 shadow-xl text-emerald-400 animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                        <div>
                          <h3 className="text-md font-bold text-white">Ledger block mined successfully!</h3>
                          <p className="text-xs text-slate-400 font-light">Issued Birth Certificate ID: <strong className="text-white font-mono">{minedResult.certificateId}</strong></p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Block Index:</span>
                          <span className="text-white font-sans font-bold">Block #{minedResult.blockIndex}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Mined Block Hash:</span>
                          <span className="text-emerald-400 text-[10px] break-all">{minedResult.blockHash}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Certificate SHA-256 Hash:</span>
                          <span className="text-primary-400 text-[10px] break-all flex items-center justify-between gap-2">
                            {minedResult.certificateHash}
                            <button 
                              onClick={() => copyToClipboard(minedResult.certificateHash)}
                              className="hover:text-white text-slate-500 transition-colors p-1"
                              title="Copy Hash"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setMinedResult(null)}
                          className="bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs px-4 py-2 rounded-lg font-medium transition-all"
                        >
                          Issue Another
                        </button>
                        <Link
                          to={`/verify/${minedResult.certificateHash}`}
                          className="bg-primary-600 hover:bg-primary-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-primary-600/10"
                        >
                          View Public Verification
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Form itself */}
                  {!minedResult && (
                    <form onSubmit={handleBirthSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
                      {submitError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-lg">
                          {submitError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="childName">
                            Child Full Name
                          </label>
                          <input
                            id="childName"
                            type="text"
                            required
                            disabled={isSubmitting}
                            placeholder="Amit Sharma"
                            value={birthForm.childName}
                            onChange={(e) => setBirthForm({ ...birthForm, childName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="gender">
                            Gender
                          </label>
                          <select
                            id="gender"
                            required
                            disabled={isSubmitting}
                            value={birthForm.gender}
                            onChange={(e) => setBirthForm({ ...birthForm, gender: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="dob">
                            Date of Birth
                          </label>
                          <input
                            id="dob"
                            type="date"
                            required
                            disabled={isSubmitting}
                            value={birthForm.dob}
                            onChange={(e) => setBirthForm({ ...birthForm, dob: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="placeOfBirth">
                            Place of Birth
                          </label>
                          <input
                            id="placeOfBirth"
                            type="text"
                            required
                            disabled={isSubmitting}
                            placeholder="RIMS Hospital, Ranchi"
                            value={birthForm.placeOfBirth}
                            onChange={(e) => setBirthForm({ ...birthForm, placeOfBirth: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="fatherName">
                            Father's Full Name
                          </label>
                          <input
                            id="fatherName"
                            type="text"
                            required
                            disabled={isSubmitting}
                            placeholder="Suresh Kumar Sharma"
                            value={birthForm.fatherName}
                            onChange={(e) => setBirthForm({ ...birthForm, fatherName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="motherName">
                            Mother's Full Name
                          </label>
                          <input
                            id="motherName"
                            type="text"
                            required
                            disabled={isSubmitting}
                            placeholder="Seema Devi"
                            value={birthForm.motherName}
                            onChange={(e) => setBirthForm({ ...birthForm, motherName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary-500/10 active:scale-98 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Mining Block Ledger (Proof of Work)...
                          </>
                        ) : (
                          'Issue & Mine Birth Certificate'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: DEATH CERTIFICATE FORM */}
              {activeTab === 'death' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-white">Issue Death Certificate</h2>
                    <p className="text-xs text-slate-400 mt-1 font-light">Create a tamper-proof digital death record and link it to the blockchain ledger.</p>
                  </div>

                  {/* Submit Success Modal */}
                  {minedResult && (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-6 space-y-4 shadow-xl text-emerald-400 animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                        <div>
                          <h3 className="text-md font-bold text-white">Ledger block mined successfully!</h3>
                          <p className="text-xs text-slate-400 font-light">Issued Death Certificate ID: <strong className="text-white font-mono">{minedResult.certificateId}</strong></p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Block Index:</span>
                          <span className="text-white font-sans font-bold">Block #{minedResult.blockIndex}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Mined Block Hash:</span>
                          <span className="text-emerald-400 text-[10px] break-all">{minedResult.blockHash}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Certificate SHA-256 Hash:</span>
                          <span className="text-primary-400 text-[10px] break-all flex items-center justify-between gap-2">
                            {minedResult.certificateHash}
                            <button 
                              onClick={() => copyToClipboard(minedResult.certificateHash)}
                              className="hover:text-white text-slate-500 transition-colors p-1"
                              title="Copy Hash"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setMinedResult(null)}
                          className="bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs px-4 py-2 rounded-lg font-medium transition-all"
                        >
                          Issue Another
                        </button>
                        <Link
                          to={`/verify/${minedResult.certificateHash}`}
                          className="bg-primary-600 hover:bg-primary-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-primary-600/10"
                        >
                          View Public Verification
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Form itself */}
                  {!minedResult && (
                    <form onSubmit={handleDeathSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
                      {submitError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-lg">
                          {submitError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="deceasedName">
                            Deceased Full Name
                          </label>
                          <input
                            id="deceasedName"
                            type="text"
                            required
                            disabled={isSubmitting}
                            placeholder="Ramesh Prasad"
                            value={deathForm.deceasedName}
                            onChange={(e) => setDeathForm({ ...deathForm, deceasedName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="dGender">
                            Gender
                          </label>
                          <select
                            id="dGender"
                            required
                            disabled={isSubmitting}
                            value={deathForm.gender}
                            onChange={(e) => setDeathForm({ ...deathForm, gender: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="dod">
                            Date of Death
                          </label>
                          <input
                            id="dod"
                            type="date"
                            required
                            disabled={isSubmitting}
                            value={deathForm.dateOfDeath}
                            onChange={(e) => setDeathForm({ ...deathForm, dateOfDeath: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="placeOfDeath">
                            Place of Death
                          </label>
                          <input
                            id="placeOfDeath"
                            type="text"
                            required
                            disabled={isSubmitting}
                            placeholder="Civil Hospital, Patna"
                            value={deathForm.placeOfDeath}
                            onChange={(e) => setDeathForm({ ...deathForm, placeOfDeath: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="age">
                            Deceased Age
                          </label>
                          <input
                            id="age"
                            type="number"
                            required
                            disabled={isSubmitting}
                            placeholder="68"
                            value={deathForm.age}
                            onChange={(e) => setDeathForm({ ...deathForm, age: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="causeOfDeath">
                            Cause of Death
                          </label>
                          <input
                            id="causeOfDeath"
                            type="text"
                            disabled={isSubmitting}
                            placeholder="Cardiac Arrest (Optional)"
                            value={deathForm.causeOfDeath}
                            onChange={(e) => setDeathForm({ ...deathForm, causeOfDeath: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="relativeName">
                            Relative / Informant Name
                          </label>
                          <input
                            id="relativeName"
                            type="text"
                            required
                            disabled={isSubmitting}
                            placeholder="Suresh Prasad (Son)"
                            value={deathForm.relativeName}
                            onChange={(e) => setDeathForm({ ...deathForm, relativeName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary-500/10 active:scale-98 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Mining Block Ledger (Proof of Work)...
                      </>
                        ) : (
                          'Issue & Mine Death Certificate'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 4: HISTORY TABLE */}
              {activeTab === 'history' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Title and Controls */}
                  <div className="border-b border-slate-800 pb-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold text-white">Registry Ledger History</h2>
                        <p className="text-xs text-slate-400 mt-1 font-light">Search and filter cryptographically indexed certificates.</p>
                      </div>
                      <button
                        onClick={loadDashboardData}
                        className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Reload registry data"
                      >
                        <Loader2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                          <Search className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search by name, ID, or hash..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-xs md:text-sm"
                        />
                      </div>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary-500 transition-all text-xs md:text-sm font-semibold"
                      >
                        <option value="all">All Certificates</option>
                        <option value="birth">Births Only</option>
                        <option value="death">Deaths Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Main Grid View of History */}
                  {filteredLogs.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                      No matching records found in the registry. Try adjusting your query or category.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredLogs.map((log) => (
                        <div key={log._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex justify-between gap-4 hover:border-slate-700/80 transition-all group">
                          <div className="space-y-2 flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                log.type === 'birth' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 
                                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {log.type}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 font-mono">{log.certificateId}</span>
                            </div>
                            
                            <h4 className="text-sm font-bold text-white leading-tight truncate">{log.name}</h4>
                            <p className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>{new Date(log.date).toLocaleDateString()}</span>
                              <span>&bull;</span>
                              <span className="truncate">{log.placeOfBirth || log.placeOfDeath}</span>
                            </p>

                            <div className="bg-slate-950 p-2 rounded border border-slate-800/80 text-[8px] font-mono text-slate-500 break-all select-all flex items-center justify-between gap-2">
                              <span className="truncate max-w-[200px]">Hash: {log.certificateHash}</span>
                              <button 
                                onClick={() => copyToClipboard(log.certificateHash)}
                                className="text-slate-600 hover:text-white transition-colors"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between items-end shrink-0">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono tracking-wider">
                              Block #{log.blockIndex}
                            </span>
                            <Link
                              to={`/verify/${log.certificateHash}`}
                              className="text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors mt-2"
                            >
                              Verify &rarr;
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-8">
        <p>&copy; {new Date().getFullYear()} Astitva Certificate Registry. Authorized personnel only.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
