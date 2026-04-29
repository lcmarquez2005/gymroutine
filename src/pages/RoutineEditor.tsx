import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkout';
import type { Routine, Exercise } from '../types';
import { ChevronLeft, Save, Plus, Trash2, GripVertical, X } from 'lucide-react';
import { ExerciseSelectorModal } from '../components/ExerciseSelectorModal';

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const RoutineEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { routines, addRoutine, updateRoutine } = useWorkout();
  
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [targetMuscleGroup, setTargetMuscleGroup] = useState('pecho');
  const [assignedDays, setAssignedDays] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const routineToEdit = routines.find(r => r.id === id);
      if (routineToEdit) {
        setName(routineToEdit.name);
        setTargetMuscleGroup(routineToEdit.targetMuscleGroup);
        setAssignedDays(routineToEdit.assignedDays || []);
        setExercises(routineToEdit.exercises);
      } else {
        navigate('/routines');
      }
    }
  }, [id, isEditing, routines, navigate]);

  const handleToggleDay = (day: string) => {
    if (assignedDays.includes(day)) {
      setAssignedDays(assignedDays.filter(d => d !== day));
    } else {
      setAssignedDays([...assignedDays, day]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('El nombre de la rutina es obligatorio');
    setIsSaving(true);

    try {
      if (isEditing) {
        await updateRoutine(id!, {
          id: id!,
          name,
          targetMuscleGroup,
          assignedDays,
          exercises
        });
      } else {
        await addRoutine({
          name,
          targetMuscleGroup,
          assignedDays,
          exercises
        });
      }
      navigate('/routines');
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al guardar la rutina');
      setIsSaving(false);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newEx = {
      ...exercise,
      sets: [{ id: `set-${Date.now()}`, reps: 0, weight: 0, completed: false }]
    };
    setExercises([...exercises, newEx]);
  };

  const handleRemoveExercise = (exIndex: number) => {
    setExercises(exercises.filter((_, idx) => idx !== exIndex));
  };

  const handleAddSet = (exIndex: number) => {
    setExercises(exercises.map((ex, idx) => {
      if (idx === exIndex) {
        return {
          ...ex,
          sets: [...ex.sets, { id: `set-${Date.now()}-${Math.random()}`, reps: 0, weight: 0, completed: false }]
        };
      }
      return ex;
    }));
  };

  const handleRemoveSet = (exIndex: number, setId: string) => {
    setExercises(exercises.map((ex, idx) => {
      if (idx === exIndex) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.id !== setId)
        };
      }
      return ex;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center pb-24">
      <div className="w-full max-w-md bg-white relative flex flex-col min-h-screen shadow-xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md px-4 py-4 border-b border-slate-100 z-10 flex items-center justify-between">
          <button 
            onClick={() => navigate('/routines')} 
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">
            {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
          </h1>
          <button 
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="p-2 -mr-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
          >
            <Save size={24} className={isSaving ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Detalles Básicos */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Rutina</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Día de Piernas"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Enfoque Principal</label>
              <select 
                value={targetMuscleGroup}
                onChange={(e) => setTargetMuscleGroup(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
              >
                <option value="pecho">Pecho</option>
                <option value="espalda">Espalda</option>
                <option value="piernas">Piernas</option>
                <option value="biceps">Bíceps</option>
                <option value="triceps">Tríceps</option>
                <option value="hombros">Hombros</option>
                <option value="fullbody">Full Body</option>
              </select>
            </div>
          </div>

          {/* Días Asignados */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Días Asignados</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => handleToggleDay(day)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                    assignedDays.includes(day)
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {day.slice(0,3)}
                </button>
              ))}
            </div>
          </div>

          {/* Ejercicios */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-700">Ejercicios</label>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 text-sm font-bold hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg"
              >
                + Añadir
              </button>
            </div>

            <div className="space-y-4">
              {exercises.map((ex, index) => (
                <div key={`${ex.id}-${index}`} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-slate-400 cursor-move" />
                      <span className="font-bold text-slate-800">{index + 1}. {ex.name}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveExercise(index)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="px-4 pt-3 pb-2 bg-white flex justify-between items-center border-b border-slate-100">
                    <label className="text-sm font-semibold text-slate-600">Descanso entre sets:</label>
                    <select
                      value={ex.restTime || 0}
                      onChange={(e) => {
                        const newExercises = [...exercises];
                        newExercises[index] = { ...ex, restTime: Number(e.target.value) };
                        setExercises(newExercises);
                      }}
                      className="text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Sin descanso</option>
                      <option value={60}>1 min</option>
                      <option value={120}>2 min</option>
                      <option value={180}>3 min</option>
                      <option value={300}>5 min</option>
                    </select>
                  </div>
                  
                  <div className="p-4 bg-white space-y-2">
                    {ex.sets.map((set, sIndex) => (
                      <div key={set.id} className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-slate-400 w-12">Set {sIndex + 1}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Objetivo: Reps/Peso en vivo</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveSet(index, set.id)}
                          className="ml-auto text-slate-300 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => handleAddSet(index)}
                      className="w-full mt-2 py-2 text-sm font-bold text-blue-500 border border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus size={16} /> Añadir Set
                    </button>
                  </div>
                </div>
              ))}
              
              {exercises.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">No has añadido ningún ejercicio.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ExerciseSelectorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={handleAddExercise}
      />
    </div>
  );
};
