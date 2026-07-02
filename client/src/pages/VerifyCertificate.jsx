import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyCertificate } from '../services/certificateService';
import { ShieldCheck, ShieldAlert, ArrowLeft, Loader2, Calendar, MapPin, User, FileText, Hash, CheckCircle, AlertTriangle } from 'lucide-react';

const VerifyCertificate = () => {
  const { hash } = useParams();
  const [certHash, setCertHash] = useState(hash || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (hashToVerify) => {
    if (!hashToVerify) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await verifyCertificate(hashToVerify);
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error during verification.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hash) {
      handleVerify(hash);
    }
  }, [hash]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!certHash.trim()) {
      setError('Please enter a valid certificate hash.');
      return;
    }
    handleVerify(certHash.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-500/10 p-2 rounded-lg border border-primary-500/30">
                <ShieldCheck className="h-6 w-6 text-primary-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Astitva<span className="text-primary-500">.</span>
              </span>
            </Link>
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Audit Ledger Signature
          </h1>
          <p className="text-sm text-slate-400">
            Query the local blockchain registry to verify certificate authenticity.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={onSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Hash className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Enter SHA-256 certificate hash..."
              value={certHash}
              onChange={(e) => setCertHash(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-xs md:text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-500/10 active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Auditing...
              </>
            ) : (
              'Audit Chain'
            )}
          </button>
        </form>

        {/* Verification Result Displays */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Querying ledger blocks...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 p-5 rounded-2xl text-red-400 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">System Error</h3>
              <p className="text-xs text-red-400/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && result && (
          <div className="space-y-6">
            
            {/* Status card */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl ${
              result.isValid && !result.compromised
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
            }`}>
              <div className="flex gap-4">
                {result.isValid && !result.compromised ? (
                  <CheckCircle className="h-10 w-10 shrink-0 mt-1 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-10 w-10 shrink-0 mt-1 text-rose-400" />
                )}
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    {result.isValid ? 'Authentic Certificate Verified' : 'Verification Denied'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-light">
                    {result.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Display certificate metadata if found */}
            {result.data?.certificate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Metada card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <FileText className="h-4 w-4 text-primary-400" />
                    Certificate Metadata
                  </h3>
                  
                  <div className="space-y-3.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Record Category:</span>
                      <span className="font-semibold text-white uppercase tracking-wider">{result.data.certificateType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registration ID:</span>
                      <span className="font-semibold text-white font-mono">{result.data.certificate.certificateId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subject Name:</span>
                      <span className="font-bold text-white text-sm">
                        {result.data.certificate.childName || result.data.certificate.deceasedName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gender:</span>
                      <span>{result.data.certificate.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        {result.data.certificate.dob ? 'Date of Birth:' : 'Date of Death:'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(result.data.certificate.dob || result.data.certificate.dateOfDeath).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Event Location:</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {result.data.certificate.placeOfBirth || result.data.certificate.placeOfDeath}
                      </span>
                    </div>
                    
                    {result.data.certificate.fatherName && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Father's Name:</span>
                          <span>{result.data.certificate.fatherName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mother's Name:</span>
                          <span>{result.data.certificate.motherName}</span>
                        </div>
                      </>
                    )}

                    {result.data.certificate.age !== undefined && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Age:</span>
                          <span>{result.data.certificate.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Informant:</span>
                          <span>{result.data.certificate.relativeName}</span>
                        </div>
                      </>
                    )}

                    <div className="border-t border-slate-800 pt-3 flex justify-between">
                      <span className="text-slate-500">Issued By:</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        {result.data.certificate.registrar?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ledger card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Ledger Audit Details
                  </h3>
                  
                  <div className="space-y-3 text-xs text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-500 block mb-1">Block Index:</span>
                      <span className="text-white font-semibold font-sans bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                        Block #{result.data.block.index}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Block Timestamp:</span>
                      <span className="text-white font-sans text-xs">
                        {new Date(result.data.block.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Proof of Work (Nonce):</span>
                      <span className="text-white font-sans">{result.data.block.nonce} iterations</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Block Hash:</span>
                      <span className="text-primary-400 break-all text-[10px] bg-slate-950 p-2 rounded block border border-slate-800/80">
                        {result.data.block.hash}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Previous Block Hash:</span>
                      <span className="text-slate-400 break-all text-[10px] bg-slate-950 p-2 rounded block border border-slate-800/80">
                        {result.data.block.previousHash}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Astitva Audit Engine. Distributed Local Ledger.</p>
      </footer>
    </div>
  );
};

export default VerifyCertificate;
