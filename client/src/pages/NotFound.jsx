import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="bg-red-500/10 p-4 rounded-full w-fit mx-auto border border-red-500/20 text-red-400">
          <AlertCircle className="h-12 w-12" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          404 - Page Not Found
        </h1>
        
        <p className="text-slate-400 text-sm">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-sm active:scale-98"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
