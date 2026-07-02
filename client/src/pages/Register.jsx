import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    const result = await register(name, email, password);
    
    setIsSubmitting(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 to-indigo-500"></div>

        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-2 mb-2 group">
            <div className="bg-primary-500/10 p-2 rounded-lg border border-primary-500/30 group-hover:border-primary-500/50 transition-colors">
              <ShieldCheck className="h-6 w-6 text-primary-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Astitva<span className="text-primary-500">.</span>
            </span>
          </Link>
          <p className="text-slate-400 text-xs font-light">
            Create a New Registrar Admin Account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-lg animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User className="h-4 w-4" />
              </span>
              <input
                id="name"
                type="text"
                required
                disabled={isSubmitting}
                placeholder="Dr. Rajesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                disabled={isSubmitting}
                placeholder="registrar@astitva.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                required
                disabled={isSubmitting}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary-500/10 active:scale-98 text-sm mt-3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6 font-light">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
