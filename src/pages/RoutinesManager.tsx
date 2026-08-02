import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkout';
import { Plus, Settings, Dumbbell, Calendar as CalendarIcon, Trash2, Edit2 } from 'lucide-react';

export const RoutinesManager: React.FC = () => {
  const { routines, deleteRoutine } = useWorkout();
  const navigate = useNavigate();

  const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const getRoutinesForDay = (day: string) => routines.filter(r => r.assignedDays?.includes(day));

  return (
    <div className="w-full bg-slate-900 min-h-screen pb-24 text-slate-100">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 pt-8 pb-8 text-white rounded-b-3xl shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestor de Rutinas</h1>
            <p className="text-blue-400 mt-1">Organiza tu semana</p>
          </div>
          <Settings size={24} className="text-slate-355 hover:text-white cursor-pointer" />
        </div>
      </div>

      <div className="px-6 mt-6 space-y-8">
        
        {/* Mis Rutinas Listado */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="text-blue-500" size={24} />
              Mis Rutinas
            </h2>
            <button 
              onClick={() => navigate('/routines/new')}
              className="bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
            >
              <Plus size={16} /> Nueva
            </button>
          </div>

          <div className="space-y-3">
            {routines.length > 0 ? routines.map(routine => (
              <div key={routine.id} className="bg-slate-800/90 border border-slate-700/60 p-4 rounded-2xl shadow-lg flex items-center justify-between hover:border-blue-500/30 transition-all">
                <div>
                  <h3 className="font-bold text-white text-lg">{routine.name}</h3>
                  <p className="text-xs text-slate-300 capitalize">{routine.exercises.length} Ejercicios • {routine.targetMuscleGroup}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/routines/${routine.id}/edit`)}
                    className="p-2 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('¿Seguro que deseas eliminar esta rutina?')) {
                        deleteRoutine(routine.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center p-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/25">
                <p className="text-slate-300 mb-4">No has creado ninguna rutina aún.</p>
                <button 
                  onClick={() => navigate('/routines/new')}
                  className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={20} /> Crear Mi Primera Rutina
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resumen Semanal */}
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <CalendarIcon className="text-blue-500" size={24} />
            Mi Semana
          </h2>
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
            {DAYS.map((day, index) => {
              const dayRoutines = getRoutinesForDay(day);
              return (
                <div key={day} className={`p-4 flex items-center ${index !== DAYS.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                  <div className="w-20 font-bold text-slate-300 capitalize">
                    {day.slice(0, 3)}
                  </div>
                  <div className="flex-1">
                    {dayRoutines.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {dayRoutines.map(r => (
                          <span key={r.id} className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md font-semibold border border-blue-500/20">
                            {r.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-455 italic">Descanso</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
