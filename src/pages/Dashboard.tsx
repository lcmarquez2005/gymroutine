import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkout';
import { Calendar, PlayCircle, Plus } from 'lucide-react';

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
  const { routines, isLoading, startWorkout } = useWorkout();
  
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
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 min-h-screen pb-24 text-slate-100">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-6 pt-8 pb-10 text-white rounded-b-3xl shadow-xl">
        <h1 className="text-2xl font-bold">¡A entrenar!</h1>
        <p className="text-blue-400 mt-1">Elige tu rutina para hoy</p>
        
        {/* Day Selector */}
        <div className="flex justify-between items-center mt-6">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`flex flex-col items-center justify-center w-10 h-12 rounded-xl font-semibold transition-all duration-300 ${
                selectedDay === day.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-sm">{day.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
            <Calendar className="text-blue-500" size={24} />
            Rutinas del {selectedDay}
          </h2>
        </div>

        <div className="space-y-4">
          {routinesForSelectedDay.length > 0 ? (
            routinesForSelectedDay.map((routine) => (
              <div 
                key={routine.id}
                className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg text-white">{routine.name}</h3>
                  <p className="text-sm text-slate-300 mt-1 capitalize">{routine.exercises.length} Ejercicios • {routine.targetMuscleGroup}</p>
                </div>
                <button 
                  onClick={() => handleStartWorkout(routine.id)}
                  className="bg-blue-600/20 text-blue-400 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                  title="Empezar entrenamiento"
                >
                  <PlayCircle size={28} />
                </button>
              </div>
            ))
          ) : (
            <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-2xl p-8 text-center mt-6">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                <Calendar className="text-slate-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Día de Descanso</h3>
              <p className="text-slate-300 text-sm mb-6">No tienes ninguna rutina programada para este día.</p>
              <button 
                onClick={() => navigate('/routines/new')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
              >
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
