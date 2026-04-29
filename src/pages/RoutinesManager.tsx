import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkout';
import { Plus, Settings, Dumbbell, Calendar as CalendarIcon, Trash2, Edit2, Star } from 'lucide-react';

export const RoutinesManager: React.FC = () => {
  const { routines, deleteRoutine, toggleFavoriteRoutine } = useWorkout();
  const navigate = useNavigate();

  const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const getRoutinesForDay = (day: string) => routines.filter(r => r.assignedDays?.includes(day));

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-blue-600 px-6 pt-8 pb-8 text-white rounded-b-3xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestor de Rutinas</h1>
            <p className="text-blue-100 mt-1">Organiza tu semana</p>
          </div>
          <Settings size={24} className="text-blue-200" />
        </div>
      </div>

      <div className="px-6 mt-6 space-y-8">
        
        {/* Mis Rutinas Listado */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Dumbbell className="text-blue-600" size={24} />
              Mis Rutinas
            </h2>
            <button 
              onClick={() => navigate('/routines/new')}
              className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl text-sm font-bold hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
              <Plus size={16} /> Nueva
            </button>
          </div>

          <div className="space-y-3">
            {routines.length > 0 ? routines.map(routine => (
              <div key={routine.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{routine.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{routine.exercises.length} Ejercicios • {routine.targetMuscleGroup}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleFavoriteRoutine(routine.id)}
                    className="p-2 text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                    title={routine.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
                  >
                    <Star size={18} fill={routine.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => navigate(`/routines/${routine.id}/edit`)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('¿Seguro que deseas eliminar esta rutina?')) {
                        deleteRoutine(routine.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-500 mb-4">No has creado ninguna rutina aún.</p>
                <button 
                  onClick={() => navigate('/routines/new')}
                  className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={20} /> Crear Mi Primera Rutina
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resumen Semanal */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <CalendarIcon className="text-blue-600" size={24} />
            Mi Semana
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {DAYS.map((day, index) => {
              const dayRoutines = getRoutinesForDay(day);
              return (
                <div key={day} className={`p-4 flex items-center ${index !== DAYS.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="w-20 font-bold text-slate-700 capitalize">
                    {day.slice(0, 3)}
                  </div>
                  <div className="flex-1">
                    {dayRoutines.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {dayRoutines.map(r => (
                          <span key={r.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-semibold border border-blue-100">
                            {r.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Descanso</span>
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
