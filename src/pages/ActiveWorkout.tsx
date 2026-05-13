import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkout';
import { Check, ChevronLeft, ChevronRight, Dumbbell, Save, Timer, Play, Pause, Square, MoreVertical } from 'lucide-react';

export const ActiveWorkout: React.FC = () => {
  const { activeWorkout, updateSet, finishWorkout, updateExerciseFeedback } = useWorkout();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timers, setTimers] = useState<Record<number, { timeLeft: number, isTimerRunning: boolean }>>({});
  const [startTime] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Timer Drag Logic
  const [timerOffset, setTimerOffset] = useState({ x: 0, y: 0 });
  const [isDraggingTimer, setIsDraggingTimer] = useState(false);
  const timerDragStart = useRef({ x: 0, y: 0, initX: 0, initY: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDraggingTimer(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    timerDragStart.current = { x: e.clientX, y: e.clientY, initX: timerOffset.x, initY: timerOffset.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingTimer) return;
    setTimerOffset({
      x: timerDragStart.current.initX + (e.clientX - timerDragStart.current.x),
      y: timerDragStart.current.initY + (e.clientY - timerDragStart.current.y)
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingTimer) return;
    setIsDraggingTimer(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const rect = e.currentTarget.getBoundingClientRect();
    const timerCenter = rect.left + rect.width / 2;
    const screenCenter = window.innerWidth / 2;

    let newX = 0;
    if (timerCenter < screenCenter) {
      newX = 16 - (window.innerWidth - rect.width - 16);
    } else {
      newX = 0;
    }

    let newY = timerOffset.y;
    const absTop = 96 + newY;
    const maxTop = window.innerHeight - rect.height - 90;
    const minTop = 20;
    if (absTop < minTop) newY = minTop - 96;
    if (absTop > maxTop) newY = maxTop - 96;


    setTimerOffset({ x: newX, y: newY });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        let hasChanges = false;
        const newTimers = { ...prev };

        Object.keys(newTimers).forEach(key => {
          const k = Number(key);
          const timer = newTimers[k];
          if (timer.isTimerRunning && timer.timeLeft > 0) {
            newTimers[k] = { ...timer, timeLeft: timer.timeLeft - 1 };
            hasChanges = true;
          } else if (timer.isTimerRunning && timer.timeLeft === 0) {
            newTimers[k] = { ...timer, isTimerRunning: false };
            hasChanges = true;
            if (k === currentIndex && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
        });

        return hasChanges ? newTimers : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    if (!activeWorkout) {
      navigate('/');
    }
  }, [activeWorkout, navigate]);

  if (!activeWorkout) return null;

  const handleCompleteWorkout = async () => {
    setIsSaving(true);
    try {
      const session = await finishWorkout(startTime);
      if (session) {
        navigate('/workout-summary', { state: { session }, replace: true });
      } else {
        navigate('/');
      }
    } catch {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeWorkout.exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentExercise = activeWorkout.exercises[currentIndex];
  const isLastExercise = currentIndex === activeWorkout.exercises.length - 1;
  const currentTimer = timers[currentIndex] || { timeLeft: 0, isTimerRunning: false };
  const { timeLeft, isTimerRunning } = currentTimer;

  // Render a progress bar or dots
  const progressPercent = ((currentIndex + 1) / activeWorkout.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-slate-900 relative flex flex-col min-h-screen">

        {/* Header Inmersivo */}
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">{activeWorkout.name}</h1>
              <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold">
                {currentIndex + 1} de {activeWorkout.exercises.length}
              </p>
            </div>
            <div className="w-8"></div> {/* Spacer for centering */}
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1 bg-slate-800">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Temporizador Flotante (Si hay restTime) */}
        {currentExercise.restTime && currentExercise.restTime > 0 ? (
          <div
            className={`fixed top-24 right-4 z-50 flex items-center gap-2 bg-slate-800/95 backdrop-blur-md border border-slate-700 p-2 rounded-full shadow-2xl cursor-grab active:cursor-grabbing touch-none ${isDraggingTimer ? '' : 'transition-transform duration-300 ease-out'}`}
            style={{ transform: `translate3d(${timerOffset.x}px, ${timerOffset.y}px, 0)` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isTimerRunning ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'bg-slate-700/50 text-slate-400'}`}>
              <Timer size={16} />
            </div>
            <div className={`text-sm font-mono font-bold pr-2 tracking-wider ${timeLeft === 0 && !isTimerRunning ? 'text-slate-300' : 'text-orange-400'}`}>
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </div>

            <div className="flex gap-1">
              {!isTimerRunning && timeLeft === 0 ? (
                <button
                  onClick={() => {
                    setTimers(prev => ({
                      ...prev,
                      [currentIndex]: { timeLeft: currentExercise.restTime || 0, isTimerRunning: true }
                    }));
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full transition-colors shadow-lg shadow-blue-600/30"
                >
                  <Play size={14} className="ml-0.5" />
                </button>
              ) : isTimerRunning ? (
                <button
                  onClick={() => {
                    setTimers(prev => ({
                      ...prev,
                      [currentIndex]: { ...prev[currentIndex], isTimerRunning: false }
                    }));
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white p-2.5 rounded-full transition-colors shadow-lg shadow-orange-600/30"
                >
                  <Pause size={14} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setTimers(prev => ({
                      ...prev,
                      [currentIndex]: { ...prev[currentIndex], isTimerRunning: true }
                    }));
                  }}
                  className="bg-green-600 hover:bg-green-500 text-white p-2.5 rounded-full transition-colors shadow-lg shadow-green-600/30"
                >
                  <Play size={14} className="ml-0.5" />
                </button>
              )}
              {timeLeft > 0 && (
                <button
                  onClick={() => {
                    setTimers(prev => {
                      const next = { ...prev };
                      delete next[currentIndex];
                      return next;
                    });
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded-full transition-colors"
                >
                  <Square size={14} />
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* Ejercicio Actual (Card Principal) */}
        <div className="flex-1 px-4 pt-4 flex flex-col ">
          <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl animate-in slide-in-from-right-8 duration-300" key={currentExercise.id}>
            <div className="bg-slate-800 px-6 py-6 border-b border-slate-700 flex flex-col items-center gap-3 text-center relative">
              <button 
                onClick={() => setOpenMenuId(openMenuId === currentExercise.id ? null : currentExercise.id)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              
              {openMenuId === currentExercise.id && (
                <div className="absolute top-14 right-4 bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl p-4 w-64 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <h4 className="text-sm font-bold text-slate-300 mb-3 text-left">Reporte de Bienestar</h4>
                  <div className="space-y-3 text-left">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={currentExercise.feedback?.jointPain || false}
                        onChange={(e) => updateExerciseFeedback(currentIndex, { jointPain: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-red-500 focus:ring-offset-slate-800"
                      />
                      <span className="text-slate-300 text-sm">Dolor articular</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={currentExercise.feedback?.possibleInjury || false}
                        onChange={(e) => updateExerciseFeedback(currentIndex, { possibleInjury: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-800"
                      />
                      <span className="text-slate-300 text-sm">Posible lesión</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={currentExercise.feedback?.feelingSick || false}
                        onChange={(e) => updateExerciseFeedback(currentIndex, { feelingSick: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-800"
                      />
                      <span className="text-slate-300 text-sm">Me siento enfermo</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="bg-blue-600/20 text-blue-400 p-4 rounded-full mb-2">
                <Dumbbell size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">{currentExercise.name}</h2>
              <p className="text-slate-400 text-sm capitalize">{currentExercise.muscleGroup}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Cabeceras de columnas */}
              <div className="grid grid-cols-4 gap-2 px-2 text-xs font-semibold text-slate-400 text-center uppercase tracking-wider mb-2">
                <div>Set</div>
                <div>Kg</div>
                <div>Reps/Segs</div>
                <div>Ok</div>
              </div>

              {/* Filas de Sets */}
              {currentExercise.sets.map((set, sIndex) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-4 gap-2 items-center p-2 rounded-2xl transition-all duration-300 ${set.completed ? 'bg-green-500/10 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-slate-900/60 border border-slate-700/50'
                    }`}
                >
                  <div className="text-center font-bold text-slate-300 text-lg">
                    {sIndex + 1}
                  </div>
                  <div>
                    {/* Peso Input */}
                    <div className="px-1">
                      {set.setType === 'TIME' ? (
                        <div className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-1 text-center text-slate-500 font-bold text-lg cursor-not-allowed">
                          -
                        </div>
                      ) : (
                        <input 
                          type="number"
                          min="0"
                          value={set.weight === undefined ? '' : set.weight}
                          onChange={(e) => updateSet(currentIndex, sIndex, { weight: Number(e.target.value) })}
                          disabled={set.completed}
                          className="w-full bg-slate-800 border border-slate-600 rounded-xl py-2 px-1 text-center text-white font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-600 transition-all disabled:opacity-50"
                          placeholder={set.targetWeight ? String(set.targetWeight) : "0"}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    {/* Reps Input */}
                    <div className="px-1 relative">
                      <input 
                        type="number"
                        min="0"
                        value={set.reps === undefined ? '' : set.reps}
                        onChange={(e) => updateSet(currentIndex, sIndex, { reps: Number(e.target.value) })}
                        disabled={set.completed}
                        className={`w-full bg-slate-800 border rounded-xl py-2 px-1 text-center text-white font-bold text-lg outline-none placeholder-slate-500 transition-all disabled:opacity-50 ${set.setType === 'TIME' ? 'border-orange-500/50 focus:ring-2 focus:ring-orange-500' : 'border-slate-600 focus:ring-2 focus:ring-blue-500'}`}
                        placeholder={set.setType === 'TIME' ? (set.targetTimeSeconds ? String(set.targetTimeSeconds) : "0") : (set.targetRepRange || "0")}
                      />
                      {set.setType === 'TIME' && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-500 uppercase tracking-wider">Segs</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => updateSet(currentIndex, sIndex, { completed: !set.completed })}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${set.completed
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/40 scale-110'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                    >
                      <Check size={24} strokeWidth={set.completed ? 3 : 2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navegación Flotante Bottom */}
        <div className="fixed bottom-0 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 p-4 pb-8 z-50">
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 bg-slate-800 text-slate-300 font-semibold py-4 rounded-2xl disabled:opacity-50 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} />
              Anterior
            </button>

            {isLastExercise ? (
              <button
                onClick={handleCompleteWorkout}
                disabled={isSaving}
                className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={24} />
                    Finalizar
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-colors"
              >
                Siguiente
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
