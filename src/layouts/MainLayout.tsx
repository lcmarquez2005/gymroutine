import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Dumbbell, User as UserIcon } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center pb-20">
      <div className="w-full max-w-md relative flex flex-col">
        {/* Content */}
        <div className="flex-1 w-full">
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex justify-between items-center rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] z-50">
          <Link to="/" className={`flex flex-col items-center transition-colors duration-200 ${isActive('/') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Home size={24} className={isActive('/') ? 'fill-blue-50' : ''} />
            <span className="text-[10px] mt-1 font-semibold">Inicio</span>
          </Link>
          <Link to="/routines" className={`flex flex-col items-center transition-colors duration-200 ${isActive('/routines') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Dumbbell size={24} className={isActive('/routines') ? 'fill-blue-50' : ''} />
            <span className="text-[10px] mt-1 font-semibold">Rutinas</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center transition-colors duration-200 ${isActive('/profile') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <UserIcon size={24} className={isActive('/profile') ? 'fill-blue-50' : ''} />
            <span className="text-[10px] mt-1 font-semibold">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
