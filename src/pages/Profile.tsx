import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWorkout } from '../hooks/useWorkout';
import { Calendar, User as UserIcon, Activity, Flame, LogOut, Clock, Weight, Download } from 'lucide-react';

export const Profile: React.FC = () => {
  const { logout, user } = useAuth();
  const { workoutHistory } = useWorkout();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Estado PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).deferredPrompt || null);
  const [canInstall, setCanInstall] = useState(Boolean((window as any).deferredPrompt));

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || (window.navigator as any).standalone;

  useEffect(() => {
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setCanInstall(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleCustomPrompt = (e: any) => {
      setDeferredPrompt(e.detail);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('pwa-prompt-available', handleCustomPrompt);

    if (isStandalone) {
      setCanInstall(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-prompt-available', handleCustomPrompt);
    };
  }, [isStandalone]);

  if (!user) {
    return <div className="text-center mt-10">No se pudo cargar el perfil</div>;
  }

  return (
    <div className="w-full bg-slate-900 min-h-screen pb-24 text-slate-100">
      <div className="w-full bg-slate-900 overflow-hidden">
        {/* Header del Perfil */}
        <div className="bg-slate-950 border-b border-slate-800 p-6 text-white text-center rounded-b-3xl shadow-xl relative">
          <button 
            onClick={logout}
            className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors border border-slate-700/60"
            title="Cerrar sesión"
          >
            <LogOut size={20} className="text-white" />
          </button>
          <div className="mx-auto bg-slate-900 h-24 w-24 rounded-full flex items-center justify-center mb-4 border-4 border-slate-700/80 shadow-lg">
            <UserIcon size={48} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-blue-400 opacity-90">{user.email}</p>

          <div className="flex justify-around mt-6 bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-center">
              <span className="block text-xl font-bold">{workoutHistory.length}</span>
              <span className="text-xs text-slate-300">Entrenos</span>
            </div>
            <div className="text-center border-l border-slate-800 pl-4">
              <span className="block text-xl font-bold text-orange-400 flex items-center justify-center gap-1">
                <Flame size={16} /> 3
              </span>
              <span className="text-xs text-slate-300">Racha actual</span>
            </div>
          </div>
        </div>

        {/* Card de Instalación PWA */}
        {!isStandalone && (canInstall || isIOS || isMobile) && (
          <div className="px-6 pt-6">
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Instalar GymRoutine</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Agrega el acceso directo para usar en pantalla completa y offline.
                  </p>
                </div>
              </div>
              
              {canInstall ? (
                <button
                  onClick={async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') {
                        setCanInstall(false);
                      }
                    }
                  }}
                  className="w-full mt-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download size={14} /> Descargar Aplicación
                </button>
              ) : isIOS ? (
                <div className="mt-1 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-[10px] text-slate-300 leading-normal">
                  <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1">
                    <span>📱</span> Pasos para instalar en iOS (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Presiona el botón <span className="font-bold text-blue-400">Compartir</span> en el navegador.</li>
                    <li>Desliza y selecciona <span className="font-bold text-blue-400">Añadir a la pantalla de inicio</span>.</li>
                  </ol>
                </div>
              ) : (
                <div className="mt-1 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-[10px] text-slate-300 leading-normal">
                  <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1">
                    <span>🤖</span> Pasos para instalar en tu navegador (Brave, Firefox, etc.):
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Presiona el botón de <span className="font-bold text-blue-400">menú (los 3 puntos)</span> de tu navegador.</li>
                    <li>Selecciona <span className="font-bold text-blue-400">Instalar aplicación</span> o <span className="font-bold text-blue-400">Añadir a pantalla de inicio</span>.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/*/ Sección de Días de Entrenamiento */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="text-blue-500" size={24} />
            Historial de Entrenamiento
          </h2>

          <div className="space-y-4">
            {workoutHistory.map((session) => (
              <div
                key={session.id}
                className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-4 shadow-lg hover:border-blue-500/30 transition-all duration-300 flex flex-col gap-3 cursor-pointer"
                onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-slate-900 border border-slate-700/60 text-blue-400 rounded-xl p-3 flex flex-col items-center justify-center min-w-[60px]">
                    <span className="text-xs font-semibold uppercase">{new Date(session.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                    <span className="text-xl font-bold">{new Date(session.date).getDate()}</span>
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="font-bold text-white text-lg">{session.routineName}</h3>
                    <div className="flex gap-4 mt-1 text-sm font-semibold text-slate-300">
                      <span className="flex items-center gap-1"><Clock size={14} className="text-slate-400"/> {session.durationMinutes} min</span>
                      <span className="flex items-center gap-1"><Weight size={14} className="text-slate-400"/> {session.totalVolume} kg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/40">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Activity size={12} /> Grupos Musculares
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {session.muscleGroupsTrained.length > 0 ? session.muscleGroupsTrained.map((muscle, mIndex) => (
                      <span
                        key={mIndex}
                        className="bg-blue-600/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
                      >
                        {muscle}
                      </span>
                    )) : (
                      <span className="text-xs text-slate-400 italic">No especificado</span>
                    )}
                  </div>
                </div>

                {expandedSessionId === session.id && (
                  <div className="mt-2 pt-4 border-t border-slate-700/60 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                      Detalle del Entrenamiento
                    </h4>
                    {session.exercises ? (
                      <div className="space-y-3">
                        {session.exercises.map((exercise, idx) => (
                          <div key={idx} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                            <h5 className="text-sm font-bold text-white mb-2">{exercise.name}</h5>
                            <div className="space-y-1.5">
                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx} className={`flex justify-between items-center text-xs p-2 rounded-lg ${set.completed ? 'bg-blue-955/60 text-blue-400 border border-blue-900/30 font-semibold' : 'bg-slate-800 text-slate-400'}`}>
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
                      <div className="text-sm text-slate-400 italic text-center py-4 bg-slate-900/60 rounded-xl border border-slate-800">
                        Detalles no disponibles para este entrenamiento antiguo.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {workoutHistory.length === 0 && (
              <div className="text-center py-10 bg-slate-800 border-2 border-dashed border-slate-700 rounded-3xl">
                <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-500 border border-slate-800">
                  <Activity size={32} />
                </div>
                <h3 className="text-lg font-bold text-white">Aún no hay historial</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-[200px] mx-auto">Tus entrenamientos finalizados aparecerán aquí.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
