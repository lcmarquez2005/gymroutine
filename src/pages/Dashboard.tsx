import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkout';
import { Calendar, PlayCircle, Plus, Star } from 'lucide-react';

const DAYS_OF_WEEK = [
  { key: 'lunes', label: 'L' },
  { key: 'martes', label: 'M' },
  { key: 'miercoles', label: 'X' },
  { key: 'jueves', label: 'J' },
  { key: 'viernes', label: 'V' },
  { key: 'sabado', label: 'S' },
  { key: 'domingo', label: 'D' }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { routines, isLoading, startWorkout, toggleFavoriteRoutine } = useWorkout();
  
  // Por defecto empezamos el lunes en esta simulación, o calculamos el dia actual
  const todayIndex = (new Date().getDay() + 6) % 7; // Lunes = 0, Domingo = 6
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[todayIndex].key);

  const routinesForSelectedDay = routines.filter(r => r.assignedDays?.includes(selectedDay));

  const handleStartWorkout = (routineId: string) => {
    startWorkout(routineId);
    navigate(`/workout/${routineId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-blue-600 px-6 pt-8 pb-10 text-white rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold">¡A entrenar!</h1>
        <p className="text-blue-100 mt-1">Elige tu rutina para hoy</p>
        
        {/* Day Selector */}
        <div className="flex justify-between items-center mt-6">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`flex flex-col items-center justify-center w-10 h-12 rounded-xl font-semibold transition-all duration-300 ${
                selectedDay === day.key
                  ? 'bg-white text-blue-600 shadow-lg scale-110'
                  : 'text-blue-100 hover:bg-white/20'
              }`}
            >
              <span className="text-sm">{day.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            Rutinas del {selectedDay}
          </h2>
        </div>

        <div className="space-y-4">
          {routinesForSelectedDay.length > 0 ? (
            routinesForSelectedDay.map((routine) => (
              <div 
                key={routine.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800">{routine.name}</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteRoutine(routine.id);
                      }}
                      className="text-yellow-400 hover:scale-110 transition-transform"
                      title={routine.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
                    >
                      <Star size={20} fill={routine.isFavorite ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 capitalize">{routine.exercises.length} Ejercicios • {routine.targetMuscleGroup}</p>
                </div>
                <button 
                  onClick={() => handleStartWorkout(routine.id)}
                  className="bg-blue-50 text-blue-600 p-3 rounded-full hover:bg-blue-100 transition-colors"
                  title="Empezar entrenamiento"
                >
                  <PlayCircle size={28} />
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center mt-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Día de Descanso</h3>
              <p className="text-slate-500 text-sm mb-6">No tienes ninguna rutina programada para este día.</p>
              <button className="bg-blue-600 text-white font-medium py-2 px-6 rounded-xl shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto">
                <Plus size={20} />
                Crear Rutina
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
