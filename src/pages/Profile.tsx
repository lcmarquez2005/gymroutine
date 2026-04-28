import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWorkout } from '../hooks/useWorkout';
import { Calendar, User as UserIcon, Activity, Flame, LogOut, Clock, Weight } from 'lucide-react';

export const Profile: React.FC = () => {
  const { logout, user } = useAuth();
  const { workoutHistory } = useWorkout();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  if (!user) {
    return <div className="text-center mt-10">No se pudo cargar el perfil</div>;
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      <div className="w-full bg-white shadow-sm overflow-hidden">
        {/* Header del Perfil */}
        <div className="bg-blue-600 p-6 text-white text-center rounded-b-3xl shadow-md relative">
          <button 
            onClick={logout}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} className="text-white" />
          </button>
          <div className="mx-auto bg-white/20 h-24 w-24 rounded-full flex items-center justify-center mb-4 border-4 border-white/30 backdrop-blur-sm">
            <UserIcon size={48} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-blue-100 opacity-90">{user.email}</p>

          <div className="flex justify-around mt-6 bg-white/10 rounded-xl p-3 backdrop-blur-md">
            <div className="text-center">
              <span className="block text-xl font-bold">{workoutHistory.length}</span>
              <span className="text-xs text-blue-100">Entrenos</span>
            </div>
            <div className="text-center border-l border-white/20 pl-4">
              <span className="block text-xl font-bold text-orange-300 flex items-center justify-center gap-1">
                <Flame size={16} /> 3
              </span>
              <span className="text-xs text-blue-100">Racha actual</span>
            </div>
          </div>
        </div>

        {/* Sección de Días de Entrenamiento */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            Historial de Entrenamiento
          </h2>

          <div className="space-y-4">
            {workoutHistory.map((session) => (
              <div
                key={session.id}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-3 cursor-pointer"
                onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 text-blue-600 rounded-xl p-3 flex flex-col items-center justify-center min-w-[60px]">
                    <span className="text-xs font-semibold uppercase">{new Date(session.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                    <span className="text-xl font-bold">{new Date(session.date).getDate()}</span>
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="font-bold text-slate-800 text-lg">{session.routineName}</h3>
                    <div className="flex gap-4 mt-1 text-sm font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={14} className="text-slate-400"/> {session.durationMinutes} min</span>
                      <span className="flex items-center gap-1"><Weight size={14} className="text-slate-400"/> {session.totalVolume} kg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Activity size={12} /> Grupos Musculares
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {session.muscleGroupsTrained.length > 0 ? session.muscleGroupsTrained.map((muscle, mIndex) => (
                      <span
                        key={mIndex}
                        className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
                      >
                        {muscle}
                      </span>
                    )) : (
                      <span className="text-xs text-slate-400 italic">No especificado</span>
                    )}
                  </div>
                </div>

                {expandedSessionId === session.id && (
                  <div className="mt-2 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      Detalle del Entrenamiento
                    </h4>
                    {session.exercises ? (
                      <div className="space-y-3">
                        {session.exercises.map((exercise, idx) => (
                          <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <h5 className="text-sm font-bold text-slate-800 mb-2">{exercise.name}</h5>
                            <div className="space-y-1.5">
                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx} className={`flex justify-between items-center text-xs p-2 rounded-lg ${set.completed ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-slate-200 text-slate-500'}`}>
                                  <span>Serie {setIdx + 1}</span>
                                  <span>{set.weight} kg x {set.reps} reps</span>
                                  <span>{set.completed ? '✓' : '✗'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl">
                        Detalles no disponibles para este entrenamiento antiguo.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {workoutHistory.length === 0 && (
              <div className="text-center py-10 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="mx-auto w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Activity size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Aún no hay historial</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto">Tus entrenamientos finalizados aparecerán aquí.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
