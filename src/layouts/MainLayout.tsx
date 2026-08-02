import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Dumbbell, User as UserIcon, BookOpen } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path: string) => location.pathname === path;
  const showBottomNav = !location.pathname.startsWith('/workout');

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex justify-center ${showBottomNav ? 'pb-20' : ''}`}>
      <div className="w-full max-w-md relative flex flex-col">
        {/* Content */}
        <div className="flex-1 w-full">
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <div className="fixed bottom-0 w-full max-w-md bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-6 py-3 flex justify-between items-center rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.4)] z-50">
            <Link to="/" className={`flex flex-col items-center transition-colors duration-200 ${isActive('/') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'}`}>
              <Home size={24} className={isActive('/') ? 'fill-blue-500/10' : ''} />
              <span className="text-[10px] mt-1 font-semibold">Inicio</span>
            </Link>
            <Link to="/routines" className={`flex flex-col items-center transition-colors duration-200 ${isActive('/routines') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'}`}>
              <Dumbbell size={24} className={isActive('/routines') ? 'fill-blue-500/10' : ''} />
              <span className="text-[10px] mt-1 font-semibold">Rutinas</span>
            </Link>
            <Link to="/exercises" className={`flex flex-col items-center transition-colors duration-200 ${isActive('/exercises') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'}`}>
              <BookOpen size={24} className={isActive('/exercises') ? 'fill-blue-500/10' : ''} />
              <span className="text-[10px] mt-1 font-semibold">Ejercicios</span>
            </Link>
            <Link to="/profile" className={`flex flex-col items-center transition-colors duration-200 ${isActive('/profile') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'}`}>
              <UserIcon size={24} className={isActive('/profile') ? 'fill-blue-500/10' : ''} />
              <span className="text-[10px] mt-1 font-semibold">Perfil</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
