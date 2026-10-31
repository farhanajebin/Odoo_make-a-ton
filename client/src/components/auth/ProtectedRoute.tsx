import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-loopnex-deepNavy">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-loopnex-electricTeal via-loopnex-softCyan to-loopnex-violetAccent p-0.5 shadow-glow-teal animate-pulse">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-loopnex-deepNavy">
              <span className="font-extrabold text-lg tracking-wider text-loopnex-electricTeal">
                LX
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-loopnex-secondaryText">
            <span className="h-1.5 w-1.5 rounded-full bg-loopnex-electricTeal animate-ping" />
            Verifying Identity Session...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
