import React, { useState } from 'react';
import { useWorkout } from '../hooks/useWorkout';
import type { Exercise } from '../types';
import { X, Plus, Search, Trash2 } from 'lucide-react';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { exerciseLibrary, addExerciseToLibrary, deleteExerciseFromLibrary } = useWorkout();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('pecho');
  const [isTimeBased, setIsTimeBased] = useState(false);

  if (!isOpen) return null;

  const filteredExercises = exerciseLibrary.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (newExName.trim()) {
      try {
        const newEx = await addExerciseToLibrary({
          name: newExName,
          muscleGroup: newExMuscle,
          isTimeBased
        } as any);
        onSelect(newEx);
        setNewExName('');
        setIsTimeBased(false);
        setIsCreating(false);
        onClose();
      } catch (error) {
        alert('Error al crear el ejercicio');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Librería de Ejercicios</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {!isCreating ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar ejercicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                {filteredExercises.map(ex => (
                  <div 
                    key={ex.id} 
                    onClick={() => { onSelect(ex); onClose(); }}
                    className="p-3 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{ex.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{ex.muscleGroup}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('¿Seguro que deseas eliminar este ejercicio?')) {
                            deleteExerciseFromLibrary(ex.id).catch(() => alert('Error al eliminar'));
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <Plus size={18} className="text-blue-500" />
                    </div>
                  </div>
                ))}
                {filteredExercises.length === 0 && (
                  <p className="text-center text-slate-500 py-4 text-sm">No se encontraron ejercicios.</p>
                )}
              </div>

              <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                + Crear Ejercicio Nuevo
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Ejercicio</label>
                <input 
                  type="text" 
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. Press Inclinado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grupo Muscular</label>
                <select 
                  value={newExMuscle}
                  onChange={(e) => setNewExMuscle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="pecho">Pecho</option>
                  <option value="espalda">Espalda</option>
                  <option value="piernas">Piernas</option>
                  <option value="biceps">Bíceps</option>
                  <option value="triceps">Tríceps</option>
                  <option value="hombros">Hombros</option>
                  <option value="core">Core</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTimeBased}
                    onChange={(e) => setIsTimeBased(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  Es un ejercicio por tiempo (ej. Planchas)
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!newExName.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Crear y Añadir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
