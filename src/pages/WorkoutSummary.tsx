import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { WorkoutSession } from '../types';
import { Trophy, Clock, Weight, CheckCircle2, Home } from 'lucide-react';

export const WorkoutSummary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session as WorkoutSession | undefined;

  if (!session) {
    // Si no hay sesión (ej. navegación directa), volver al inicio
    setTimeout(() => navigate('/', { replace: true }), 0);
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center pb-8">
      <div className="w-full max-w-md bg-slate-900 flex flex-col min-h-screen relative">
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 mt-12">
          
          {/* Trofeo y Título */}
          <div className="text-center animate-in zoom-in duration-500">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-yellow-500/20 rounded-full border-4 border-yellow-500/30 mb-6 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
              <Trophy size={64} className="text-yellow-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">¡Entrenamiento Completado!</h1>
            <p className="text-slate-400 font-semibold">{session.routineName}</p>
          </div>

          {/* Estadísticas */}
          <div className="w-full grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-8 duration-500 delay-150">
            {/* Tiempo */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-3xl flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                <Clock size={28} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{session.durationMinutes} <span className="text-sm font-semibold text-slate-400">min</span></p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Tiempo</p>
              </div>
            </div>

            {/* Volumen */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-3xl flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-purple-500/20 rounded-full text-purple-400">
                <Weight size={28} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{session.totalVolume} <span className="text-sm font-semibold text-slate-400">kg</span></p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Volumen</p>
              </div>
            </div>

            {/* Sets Completados */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 col-span-2">
              <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                <CheckCircle2 size={28} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{session.completedSets} <span className="text-lg font-bold text-slate-500">/ {session.totalSets}</span></p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Sets Completados</p>
              </div>
            </div>
          </div>

          {/* Músculos Entrenados */}
          {session.muscleGroupsTrained.length > 0 && (
            <div className="w-full text-center animate-in fade-in duration-500 delay-300">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Músculos Trabajados</p>
              <div className="flex flex-wrap justify-center gap-2">
                {session.muscleGroupsTrained.map(muscle => (
                  <span key={muscle} className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold capitalize">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Action */}
        <div className="p-6">
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Home size={24} />
            Volver al Inicio
          </button>
        </div>
        
      </div>
    </div>
  );
};
