import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Route guard component that restricts access to authenticated users only.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show premium loading spinner while checking session status
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center space-y-3 backdrop-blur shadow-2xl">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <span className="text-xs text-slate-400 font-medium tracking-wider">Verifying Session...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
