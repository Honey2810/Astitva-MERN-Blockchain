import React, { useState } from 'react';
import { ShieldCheck, Search, Database, FileCheck, Layers } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [certHash, setCertHash] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    if (certHash.trim()) {
      navigate(`/verify/${certHash.trim()}`);
    }
  };

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
          
          <nav className="flex items-center space-x-4">
            <Link to="/verify" className="text-sm font-medium text-slate-400 hover:text-white transition-colors mr-2">
              Audit Ledger
            </Link>
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-lg transition-colors border border-primary-500/20 shadow-lg shadow-primary-500/10">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs text-primary-400 font-medium">
            <Layers className="h-3 w-3" />
            <span>Secured with Local Cryptographic Ledger</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Immutable & Tamper-Proof <br className="hidden md:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400">
              Certificate Ledger
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Astitva secures vital records like birth and death certificates using a locally simulated blockchain. Anyone can instantly verify certificate authenticity.
          </p>
        </div>

        {/* Verification Widget */}
        <div className="mt-12 w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary-500/5 rounded-full blur-xl group-hover:bg-primary-500/10 transition-all duration-700"></div>
          <h2 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary-400" />
            Instant Certificate Verification
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mb-6">
            Enter the SHA-256 hash printed on the certificate to check its registry status and cryptographic block index.
          </p>

          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Enter SHA-256 certificate hash..."
                value={certHash}
                onChange={(e) => setCertHash(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-500 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-500/10 active:scale-95 text-sm"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Features / Stats Grid */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800/80">
            <div className="bg-primary-500/10 p-3 rounded-lg w-fit border border-primary-500/20 mb-4">
              <Database className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Database</h3>
            <p className="text-slate-400 text-sm">
              All client profiles and official metadata are structured securely inside a scalable MongoDB Atlas database.
            </p>
          </div>

          <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800/80">
            <div className="bg-primary-500/10 p-3 rounded-lg w-fit border border-primary-500/20 mb-4">
              <Layers className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Cryptographic Ledger</h3>
            <p className="text-slate-400 text-sm">
              Every certificate maps to a block in a cryptographic ledger containing the hash signature of the previous record.
            </p>
          </div>

          <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800/80">
            <div className="bg-primary-500/10 p-3 rounded-lg w-fit border border-primary-500/20 mb-4">
              <FileCheck className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Dual Verification</h3>
            <p className="text-slate-400 text-sm">
              Verify records via database query lookup or trace the immutability directly through hash checksum audits.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Astitva Certificate Ledger. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
