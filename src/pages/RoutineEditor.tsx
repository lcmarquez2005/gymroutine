import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkout';
import type { Exercise } from '../types';
import { ChevronLeft, Save, Plus, Trash2, GripVertical, X, Minus } from 'lucide-react';
import { ExerciseSelectorModal } from '../components/ExerciseSelectorModal';

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

// Extendemos el tipo para uso local en el editor
interface EditingExercise extends Exercise {
  tempId: string;
}

export const RoutineEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { routines, addRoutine, updateRoutine } = useWorkout();
  
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [targetMuscleGroup, setTargetMuscleGroup] = useState('pecho');
  const [assignedDays, setAssignedDays] = useState<string[]>([]);
  const [exercises, setExercises] = useState<EditingExercise[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const routineToEdit = routines.find(r => r.id === id);
      if (routineToEdit) {
        setName(routineToEdit.name);
        setTargetMuscleGroup(routineToEdit.targetMuscleGroup);
        setAssignedDays(routineToEdit.assignedDays || []);
        // Asignamos tempId a los ejercicios existentes
        setExercises(routineToEdit.exercises.map(ex => ({
          ...ex,
          tempId: ex.id // Para los existentes, usamos su ID como tempId inicial
        })));
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

    // Limpiamos los ejercicios para el backend
    const cleanExercises = exercises.map(ex => {
      // Si el tempId NO es el ID real (es uno generado en el frontend para un ejercicio nuevo),
      // enviamos el ID original de la librería.
      // Si es un ejercicio que ya estaba en la rutina, mantenemos su ID.
      
      const cleanSets = ex.sets.map(s => {
        // Si el ID del set es temporal (generado en el frontend), lo quitamos
        // para que el backend lo genere.
        if (s.id.startsWith('set-')) {
          const { id: _, ...setWithoutId } = s;
          return setWithoutId;
        }
        return s;
      });

      const { tempId: _, ...exerciseWithoutTempId } = ex;
      return {
        ...exerciseWithoutTempId,
        sets: cleanSets
      };
    });

    try {
      if (isEditing) {
        await updateRoutine(id!, {
          id: id!,
          name,
          targetMuscleGroup,
          assignedDays,
          exercises: cleanExercises as Exercise[]
        });
      } else {
        await addRoutine({
          name,
          targetMuscleGroup,
          assignedDays,
          exercises: cleanExercises as Exercise[]
        });
      }
      navigate('/routines');
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al guardar la rutina. Verifica que el backend esté funcionando correctamente.');
      setIsSaving(false);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    setExercises([...exercises, {
      ...exercise,
      tempId: `ex-${Date.now()}`,
      sets: []
    }]);
  };

  const handleRemoveExercise = (tempId: string) => {
    setExercises(exercises.filter(ex => ex.tempId !== tempId));
  };

  const handleAddSet = (tempId: string, type: 'reps' | 'time') => {
    setExercises(exercises.map(ex => {
      if (ex.tempId === tempId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { 
            id: `set-${Date.now()}-${Math.random()}`, 
            setType: type === 'time' ? 'TIME' : 'REPS',
            targetRepRange: lastSet && lastSet.targetRepRange !== undefined ? lastSet.targetRepRange : (type === 'reps' ? '' : undefined),
            targetWeight: lastSet && lastSet.targetWeight !== undefined ? lastSet.targetWeight : (type === 'reps' ? 0 : undefined),
            targetTimeSeconds: lastSet && lastSet.targetTimeSeconds !== undefined ? lastSet.targetTimeSeconds : (type === 'time' ? 0 : undefined),
            completed: false 
          }]
        };
      }
      return ex;
    }));
  };

  const handleRemoveSet = (tempId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.tempId === tempId) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.id !== setId)
        };
      }
      return ex;
    }));
  };

  const handleUpdateSetTarget = (tempId: string, setId: string, updates: Partial<import('../types').Set>) => {
    setExercises(exercises.map(ex => {
      if (ex.tempId === tempId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
        };
      }
      return ex;
    }));
  };

  const adjustRepRange = (tempId: string, setId: string, currentValue: string, amount: number) => {
    const match = currentValue.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const newVal = Math.max(0, num + amount);
      const replaced = currentValue.replace(/(\d+)$/, String(newVal));
      handleUpdateSetTarget(tempId, setId, { targetRepRange: replaced });
    } else {
      const newVal = Math.max(0, amount);
      handleUpdateSetTarget(tempId, setId, { targetRepRange: String(newVal) });
    }
  };

  const handleUpdateRestTime = (tempId: string, restTime: number) => {
    setExercises(exercises.map(ex => {
      if (ex.tempId === tempId) {
        return { ...ex, restTime };
      }
      return ex;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center pb-24 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 relative flex flex-col min-h-screen shadow-xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md px-4 py-4 border-b border-slate-800 z-10 flex items-center justify-between">
          <button 
            onClick={() => navigate('/routines')} 
            className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">
            {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
          </h1>
          <button 
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="p-2 -mr-2 text-blue-500 hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
          >
            <Save size={24} className={isSaving ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Detalles Básicos */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Nombre de la Rutina</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Día de Piernas"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Enfoque Principal</label>
              <select 
                value={targetMuscleGroup}
                onChange={(e) => setTargetMuscleGroup(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
            <label className="block text-sm font-bold text-slate-400 mb-2">Días Asignados</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => handleToggleDay(day)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                    assignedDays.includes(day)
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
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
              <label className="block text-sm font-bold text-slate-400">Ejercicios</label>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-blue-400 text-sm font-bold hover:text-blue-300 bg-blue-600/20 px-3 py-1.5 rounded-lg transition-all active:scale-95"
              >
                + Añadir
              </button>
            </div>

            <div className="space-y-4">
              {exercises.map((ex, index) => (
                <div key={ex.tempId} className="bg-slate-800/90 border border-slate-700/60 rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-slate-950 px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-slate-500 cursor-move" />
                      <span className="font-bold text-white">{index + 1}. {ex.name}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveExercise(ex.tempId)}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="px-4 pt-3 pb-2 bg-slate-800 flex justify-between items-center border-b border-slate-700/60">
                    <label className="text-sm font-semibold text-slate-400">Descanso entre sets:</label>
                    <select
                      value={ex.restTime || 0}
                      onChange={(e) => handleUpdateRestTime(ex.tempId, Number(e.target.value))}
                      className="text-sm bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Sin descanso</option>
                      <option value={60}>1 min</option>
                      <option value={120}>2 min</option>
                      <option value={180}>3 min</option>
                      <option value={300}>5 min</option>
                    </select>
                  </div>
                  
                  <div className="p-4 bg-slate-800 space-y-2">
                    {ex.sets.map((set, sIndex) => (
                      <div key={set.id} className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-400 text-xs w-11 flex-shrink-0">Set {sIndex + 1}</span>
                        <div className="flex flex-1 items-center gap-2">
                          {set.setType === 'TIME' ? (
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-orange-400 text-xs font-semibold whitespace-nowrap">Obj. Segs:</span>
                              <div className="flex items-center justify-between bg-slate-900 border border-slate-700/80 rounded-xl p-1 gap-1 focus-within:ring-2 focus-within:ring-orange-500 h-9 flex-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentVal = set.targetTimeSeconds || 0;
                                    handleUpdateSetTarget(ex.tempId, set.id, { targetTimeSeconds: Math.max(0, currentVal - 5) });
                                  }}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 transition-all flex items-center justify-center flex-shrink-0"
                                >
                                  <Minus size={12} />
                                </button>
                                <input 
                                  type="number"
                                  min="0"
                                  value={set.targetTimeSeconds || ''}
                                  onChange={(e) => handleUpdateSetTarget(ex.tempId, set.id, { targetTimeSeconds: Number(e.target.value) })}
                                  className="w-full bg-transparent border-none text-center text-white font-bold text-xs outline-none py-1 min-w-0"
                                  placeholder="0"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentVal = set.targetTimeSeconds || 0;
                                    handleUpdateSetTarget(ex.tempId, set.id, { targetTimeSeconds: currentVal + 5 });
                                  }}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 transition-all flex items-center justify-center flex-shrink-0"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="text-blue-400 text-xs font-bold whitespace-nowrap">Kg:</span>
                                <div className="flex items-center justify-between bg-slate-900 border border-slate-700/80 rounded-xl p-1 gap-1 focus-within:ring-2 focus-within:ring-blue-500 h-9 w-full">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentVal = set.targetWeight || 0;
                                      handleUpdateSetTarget(ex.tempId, set.id, { targetWeight: Math.max(0, currentVal - 2.5) });
                                    }}
                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 transition-all flex items-center justify-center flex-shrink-0"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <input 
                                    type="number"
                                    min="0"
                                    step="2.5"
                                    value={set.targetWeight === 0 ? '' : set.targetWeight}
                                    onChange={(e) => handleUpdateSetTarget(ex.tempId, set.id, { targetWeight: Number(e.target.value) })}
                                    className="w-full bg-transparent border-none text-center text-white font-bold text-xs outline-none py-1 min-w-0"
                                    placeholder="0"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentVal = set.targetWeight || 0;
                                      handleUpdateSetTarget(ex.tempId, set.id, { targetWeight: currentVal + 2.5 });
                                    }}
                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 transition-all flex items-center justify-center flex-shrink-0"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="text-blue-400 text-xs font-bold whitespace-nowrap">Reps:</span>
                                <div className="flex items-center justify-between bg-slate-900 border border-slate-700/80 rounded-xl p-1 gap-1 focus-within:ring-2 focus-within:ring-blue-500 h-9 w-full">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentVal = set.targetRepRange || '0';
                                      adjustRepRange(ex.tempId, set.id, currentVal, -1);
                                    }}
                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 transition-all flex items-center justify-center flex-shrink-0"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <input 
                                    type="text"
                                    value={set.targetRepRange || ''}
                                    onChange={(e) => handleUpdateSetTarget(ex.tempId, set.id, { targetRepRange: e.target.value })}
                                    className="w-full bg-transparent border-none text-center text-white font-bold text-xs outline-none py-1 min-w-0"
                                    placeholder="8-12"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentVal = set.targetRepRange || '0';
                                      adjustRepRange(ex.tempId, set.id, currentVal, 1);
                                    }}
                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 transition-all flex items-center justify-center flex-shrink-0"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleRemoveSet(ex.tempId, set.id)}
                          className="ml-auto text-slate-500 hover:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      {!ex.isTimeBased && (
                        <button 
                          onClick={() => handleAddSet(ex.tempId, 'reps')}
                          className="flex-1 py-2 text-sm font-bold text-blue-400 border border-dashed border-blue-900/30 rounded-xl hover:bg-blue-600/10 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus size={16} /> Set (Reps)
                        </button>
                      )}
                      {ex.isTimeBased && (
                        <button 
                          onClick={() => handleAddSet(ex.tempId, 'time')}
                          className="flex-1 py-2 text-sm font-bold text-orange-400 border border-dashed border-orange-900/30 rounded-xl hover:bg-orange-600/10 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus size={16} /> Set (Tiempo)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {exercises.length === 0 && (
                <div className="text-center py-8 bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl">
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
