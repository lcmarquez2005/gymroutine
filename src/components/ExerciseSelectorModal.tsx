import React, { useState } from 'react';
import { useWorkout } from '../hooks/useWorkout';
import type { Exercise } from '../types';
import { Plus, Search, Trash2, Dumbbell } from 'lucide-react';
import { ModalCard } from './ModalCard';

const normalizeString = (str: string | undefined): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remueve acentos y diacríticos
};

const matchesFuzzy = (ex: Exercise, searchTerm: string): boolean => {
  const cleanSearch = normalizeString(searchTerm).trim();
  if (!cleanSearch) return true;

  // Dividimos la búsqueda por palabras para hacer una búsqueda tipo LIKE/AND
  const searchWords = cleanSearch.split(/\s+/);
  
  const textPool = [
    ex.name,
    ex.nameEs || '',
    ex.nameEn || '',
    ex.primaryMuscles || '',
    ex.secondaryMuscles || '',
    ex.equipment || '',
    ex.bodyPart || '',
    ex.muscleGroup || ''
  ].map(s => normalizeString(s)).join(' ');

  // Cada palabra buscada debe estar en la bolsa de texto
  return searchWords.every(word => textPool.includes(word));
};

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

  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return '';
    
    let cleanPath = path;
    if (path.includes('images/')) {
      const parts = path.split('images/');
      try {
        const decoded = decodeURIComponent(parts[1]);
        const sanitized = decoded.toLowerCase()
                                 .replace(/\s+/g, '-')
                                 .replace(/_/g, '-')
                                 .replace(/[^a-z0-9\.\/-]/g, '');
        cleanPath = `${parts[0]}images/${sanitized}`;
      } catch (e) {
        console.error(e);
      }
    }

    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8081';
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${baseUrl}${finalPath}`;
  };

  // Helper para resolver las imágenes de un ejercicio con fallbacks
  const getExerciseImages = (ex: Exercise) => {
    if (ex.customImageUrl) {
      return {
        start: ex.customImageUrl,
        peak: ex.customImageUrl,
        isAnimated: false
      };
    }

    const flat = ex.images?.flat || {};
    
    // Buscar propiedades planas primero, luego propiedades anidadas
    let start = ex.imageStart || flat.start || '';
    let peak = ex.imagePeak || flat.peak || '';
    let main = ex.imageMain || flat.main || '';

    // Si está todo vacío y es un ejercicio del catálogo por defecto (no UUID), creamos fallback del ID
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!start && !peak && !main && ex.id && !isUUID(ex.id)) {
      const idLower = ex.id.toLowerCase();
      // Detectamos si es un ejercicio conocido por ser estático o continuo
      const isStatic = idLower.includes('bike') || idLower.includes('plank') || idLower.includes('stretch') || idLower.includes('run') || idLower.includes('walk') || idLower.includes('hold') || idLower.includes('rope');
      if (isStatic) {
        main = `images/flat/${ex.id}-main.webp`;
      } else {
        start = `images/flat/${ex.id}-start.webp`;
        peak = `images/flat/${ex.id}-peak.webp`;
      }
    }

    const startUrl = start || main || peak;
    const peakUrl = peak || main || start;
    const hasStartAndPeak = Boolean(start && peak && start !== peak);

    return {
      start: startUrl,
      peak: peakUrl,
      isAnimated: hasStartAndPeak
    };
  };

  const filteredExercises = exerciseLibrary.filter(ex => matchesFuzzy(ex, searchTerm));

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
    <ModalCard
      isOpen={isOpen}
      onClose={onClose}
      title="Librería de Ejercicios"
      bodyClassName="p-4"
    >
          {!isCreating ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar ejercicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-500"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                {filteredExercises.map(ex => {
                  const images = getExerciseImages(ex);
                  const imageToShow = images.start;
                  const hasImage = Boolean(imageToShow);
                  
                  return (
                    <div 
                      key={ex.id} 
                      onClick={() => { onSelect(ex); onClose(); }}
                      className="p-2 border border-slate-800/60 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-12 h-12 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-800/60">
                          {hasImage ? (
                            <img 
                              src={getMediaUrl(imageToShow)} 
                              alt={ex.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Dumbbell size={16} className="text-slate-500 opacity-60" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{ex.nameEs || ex.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize truncate">{ex.muscleGroup || ex.bodyPart}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('¿Seguro que deseas eliminar este ejercicio?')) {
                              deleteExerciseFromLibrary(ex.id).catch(() => alert('Error al eliminar'));
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-955/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <Plus size={16} className="text-blue-500 mr-1" />
                      </div>
                    </div>
                  );
                })}
                {filteredExercises.length === 0 && (
                  <p className="text-center text-slate-500 py-4 text-sm">No se encontraron ejercicios.</p>
                )}
              </div>

              <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-3 border-2 border-dashed border-blue-900/30 text-blue-400 rounded-xl font-semibold hover:bg-blue-600/10 transition-colors"
              >
                + Crear Ejercicio Nuevo
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nombre del Ejercicio</label>
                <input 
                  type="text" 
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-500"
                  placeholder="Ej. Press Inclinado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Grupo Muscular</label>
                <select 
                  value={newExMuscle}
                  onChange={(e) => setNewExMuscle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="pecho">Pecho</option>
                  <option value="espalda">Espalda</option>
                  <option value="piernas">Piernas</option>
                  <option value="biceps">Bíceps</option>
                  <option value="triceps">Tríceps</option>
                  <option value="hombros">Hombros</option>
                  <option value="core">Core</option>
                  <option value="fullbody">Full Body</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTimeBased}
                    onChange={(e) => setIsTimeBased(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-700 bg-slate-950 focus:ring-blue-500"
                  />
                  Es un ejercicio por tiempo (ej. Planchas)
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!newExName.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  Crear y Añadir
                </button>
              </div>
            </div>
          )}
    </ModalCard>
  );
};
