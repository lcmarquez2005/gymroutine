import React, { useState, useMemo } from 'react';
import { useWorkout } from '../hooks/useWorkout';
import type { Exercise } from '../types';
import { 
  Search, Plus, Edit2, Trash2, X, Dumbbell, Play, Video, 
  Image as ImageIcon, Sparkles, BookOpen, AlertCircle, HelpCircle
} from 'lucide-react';

export const ExerciseLibrary: React.FC = () => {
  const { 
    exerciseLibrary, 
    addExerciseToLibrary, 
    updateExerciseInLibrary, 
    deleteExerciseFromLibrary 
  } = useWorkout();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  // Modales
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<'instructions' | 'details' | 'media'>('instructions');

  // Formulario
  const [formData, setFormData] = useState({
    nameEs: '',
    bodyPart: 'pecho',
    primaryMuscles: '',
    secondaryMuscles: '',
    difficulty: 'intermediate',
    equipment: 'body_only',
    category: 'strength',
    forceType: 'push',
    mechanic: 'compound',
    instructionsEs: '',
    tipsEs: '',
    customImageUrl: '',
    customVideoUrl: '',
    isTimeBased: false,
    met: 6.0
  });

  const muscleFilters = [
    { key: 'all', label: 'Todos' },
    { key: 'pecho', label: 'Pecho' },
    { key: 'espalda', label: 'Espalda' },
    { key: 'piernas', label: 'Piernas' },
    { key: 'hombros', label: 'Hombros' },
    { key: 'biceps', label: 'Bíceps' },
    { key: 'triceps', label: 'Tríceps' },
    { key: 'core', label: 'Core' }
  ];

  const difficulties = [
    { key: 'all', label: 'Dificultad' },
    { key: 'beginner', label: 'Principiante' },
    { key: 'intermediate', label: 'Intermedio' },
    { key: 'advanced', label: 'Avanzado' }
  ];

  // Helper para URLs
  // Helper para URLs con saneamiento de nombres de archivos
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

  // Filtrado de ejercicios
  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter(ex => {
      const matchesSearch = 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.nameEs?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.primaryMuscles?.toLowerCase().includes(searchTerm.toLowerCase());

      const exerciseMuscle = (ex.muscleGroup || ex.bodyPart || '').toLowerCase();
      const matchesMuscle = selectedMuscle === 'all' || 
        exerciseMuscle === selectedMuscle.toLowerCase() || 
        (selectedMuscle === 'core' && exerciseMuscle === 'abs');

      const matchesDifficulty = selectedDifficulty === 'all' || 
        ex.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesMuscle && matchesDifficulty;
    });
  }, [exerciseLibrary, searchTerm, selectedMuscle, selectedDifficulty]);

  // Manejar edición
  const handleOpenEdit = (ex: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEx(ex);
    setFormData({
      nameEs: ex.nameEs || ex.name,
      bodyPart: ex.bodyPart || ex.muscleGroup || 'pecho',
      primaryMuscles: ex.primaryMuscles || '',
      secondaryMuscles: ex.secondaryMuscles || '',
      difficulty: ex.difficulty || 'intermediate',
      equipment: ex.equipment || 'body_only',
      category: ex.category || 'strength',
      forceType: ex.forceType || 'push',
      mechanic: ex.mechanic || 'compound',
      instructionsEs: ex.instructionsEs || '',
      tipsEs: ex.tipsEs || '',
      customImageUrl: ex.customImageUrl || '',
      customVideoUrl: ex.customVideoUrl || '',
      isTimeBased: ex.isTimeBased || false,
      met: ex.met || 6.0
    });
    setIsFormOpen(true);
  };

  // Manejar creación nueva
  const handleOpenCreate = () => {
    setEditingEx(null);
    setFormData({
      nameEs: '',
      bodyPart: 'pecho',
      primaryMuscles: '',
      secondaryMuscles: '',
      difficulty: 'intermediate',
      equipment: 'body_only',
      category: 'strength',
      forceType: 'push',
      mechanic: 'compound',
      instructionsEs: '',
      tipsEs: '',
      customImageUrl: '',
      customVideoUrl: '',
      isTimeBased: false,
      met: 6.0
    });
    setIsFormOpen(true);
  };

  // Eliminar ejercicio
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas desactivar/eliminar este ejercicio?')) {
      try {
        await deleteExerciseFromLibrary(id);
        if (selectedExercise?.id === id) {
          setSelectedExercise(null);
        }
      } catch (err) {
        alert('Error al eliminar el ejercicio.');
      }
    }
  };

  // Enviar formulario (Crear / Editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEs.trim()) return alert('El nombre en español es obligatorio');

    try {
      const payload: Partial<Exercise> = {
        name: formData.nameEs,
        nameEs: formData.nameEs,
        bodyPart: formData.bodyPart,
        muscleGroup: formData.bodyPart,
        primaryMuscles: formData.primaryMuscles,
        secondaryMuscles: formData.secondaryMuscles,
        difficulty: formData.difficulty,
        equipment: formData.equipment,
        category: formData.category,
        forceType: formData.forceType,
        mechanic: formData.mechanic,
        instructionsEs: formData.instructionsEs,
        tipsEs: formData.tipsEs,
        customImageUrl: formData.customImageUrl || null,
        customVideoUrl: formData.customVideoUrl || null,
        isTimeBased: formData.isTimeBased,
        met: Number(formData.met)
      };

      if (editingEx) {
        await updateExerciseInLibrary(editingEx.id, payload);
      } else {
        await addExerciseToLibrary(payload);
      }
      setIsFormOpen(false);
      setEditingEx(null);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el ejercicio. Revisa los datos.');
    }
  };

  // Traducción y formato para UI
  const formatText = (text: string | undefined) => {
    if (!text) return 'N/A';
    return text.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getDifficultyColor = (diff: string | undefined) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDifficultyLabel = (diff: string | undefined) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-8 text-white rounded-b-[2rem] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Dumbbell className="animate-pulse" />
              Librería de Ejercicios
            </h1>
            <p className="text-blue-100 text-xs mt-1">
              Catálogo oficial de ejercicios y multimedia
            </p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-full transition-all shadow-md flex items-center justify-center"
            title="Crear Ejercicio"
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, músculo o técnica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white text-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-md placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="px-6 mt-6 space-y-4">
        {/* Filtros de Músculos (Scroll Horizontal) */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-6 px-6">
          {muscleFilters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedMuscle(filter.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                selectedMuscle === filter.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Selector de Dificultad */}
        <div className="flex gap-2">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
          >
            {difficulties.map(d => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400 flex items-center ml-auto">
            {filteredExercises.length} ejercicios encontrados
          </span>
        </div>
      </div>

      {/* Grid de Ejercicios */}
      <div className="px-6 mt-4 space-y-4">
        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredExercises.map(ex => {
              const images = getExerciseImages(ex);
              const imageToShow = images.start;
              const hasImage = Boolean(imageToShow);
              
              return (
                <div 
                  key={ex.id}
                  onClick={() => { setSelectedExercise(ex); setActiveTab('instructions'); }}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer flex"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-slate-100 relative flex-shrink-0 flex items-center justify-center overflow-hidden border-r border-slate-100">
                    {hasImage ? (
                      <img 
                        src={getMediaUrl(imageToShow)} 
                        alt={ex.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Si falla la carga, ocultar imagen y mostrar placeholder
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-slate-400 p-2 text-center">
                        <Dumbbell size={24} className="mx-auto opacity-40 mb-1" />
                        <span className="text-[10px] block opacity-50">Sin foto</span>
                      </div>
                    )}
                    {ex.customVideoUrl && (
                      <span className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-md shadow flex items-center justify-center">
                        <Play size={10} fill="white" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">
                          {ex.nameEs || ex.name}
                        </h3>
                        {ex.difficulty && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold border ${getDifficultyColor(ex.difficulty)}`}>
                            {getDifficultyLabel(ex.difficulty)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 capitalize flex items-center gap-1">
                        <span className="font-bold text-blue-600">{formatText(ex.muscleGroup || ex.bodyPart)}</span>
                        {ex.equipment && <span>• {formatText(ex.equipment)}</span>}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                        {formatText(ex.category)}
                      </span>
                      
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleOpenEdit(ex, e)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(ex.id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <HelpCircle size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold text-sm">No encontramos ejercicios</p>
            <p className="text-slate-400 text-xs mt-1">Prueba con otra búsqueda o filtro</p>
            <button 
              onClick={handleOpenCreate}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              + Crear Ejercicio Nuevo
            </button>
          </div>
        )}
      </div>

      {/* DETALLE DEL EJERCICIO (SHEET MODAL) */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            
            {/* Cabecera / Banner */}
            <div className="relative h-48 bg-slate-900 flex-shrink-0">
              {/* Carrusel de Imágenes */}
              <div className="absolute inset-0 flex">
                {(() => {
                  const images = getExerciseImages(selectedExercise);
                  if (images.isAnimated) {
                    return (
                      <>
                        <div className="w-1/2 h-full relative border-r border-slate-800">
                          <img 
                            src={getMediaUrl(images.start)} 
                            alt="Inicio" 
                            className="w-full h-full object-cover opacity-80" 
                          />
                          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">Inicio</span>
                        </div>
                        <div className="w-1/2 h-full relative">
                          <img 
                            src={getMediaUrl(images.peak)} 
                            alt="Pico" 
                            className="w-full h-full object-cover opacity-80" 
                          />
                          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">Pico</span>
                        </div>
                      </>
                    );
                  }
                  
                  if (images.start) {
                    return (
                      <div className="w-full h-full relative">
                        <img 
                          src={getMediaUrl(images.start)} 
                          alt={selectedExercise.name} 
                          className="w-full h-full object-cover opacity-85" 
                        />
                      </div>
                    );
                  }
                  
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-700 to-indigo-800">
                      <Dumbbell size={50} className="text-white/20 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                  );
                })()}
              </div>
              
              {/* Degradado y Textos */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20 flex flex-col justify-end p-5">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                  {formatText(selectedExercise.muscleGroup || selectedExercise.bodyPart)}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedExercise.nameEs || selectedExercise.name}
                </h2>
                {selectedExercise.nameEn && (
                  <p className="text-[11px] text-slate-300 italic">{selectedExercise.nameEn}</p>
                )}
              </div>

              {/* Botón de cierre */}
              <button 
                onClick={() => setSelectedExercise(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selector de pestañas */}
            <div className="flex border-b border-slate-100 bg-slate-50 p-1 flex-shrink-0">
              <button
                onClick={() => setActiveTab('instructions')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'instructions'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Guía de Ejecución
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'details'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Ficha Técnica
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'media'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Mi Multimedia
              </button>
            </div>

            {/* Contenido Pestañas */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {activeTab === 'instructions' && (
                <div className="space-y-4">
                  {/* Descripción */}
                  {selectedExercise.descriptionEs && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                        <Sparkles size={14} /> Enfoque
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedExercise.descriptionEs}
                      </p>
                    </div>
                  )}

                  {/* Pasos */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <BookOpen size={16} className="text-blue-600" />
                      Instrucciones paso a paso
                    </h4>
                    {selectedExercise.instructionsEs ? (
                      <div className="space-y-3">
                        {selectedExercise.instructionsEs.split('\n').filter(Boolean).map((step, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No hay instrucciones registradas para este ejercicio.</p>
                    )}
                  </div>

                  {/* Consejos */}
                  {selectedExercise.tipsEs && (
                    <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
                        <AlertCircle size={14} /> Consejos de Seguridad
                      </h4>
                      <div className="space-y-1.5">
                        {selectedExercise.tipsEs.split('\n').filter(Boolean).map((tip, idx) => (
                          <p key={idx} className="text-[11px] text-slate-600 flex items-start gap-1">
                            <span>•</span>
                            <span>{tip}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Grid Técnico */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Dificultad</p>
                      <p className="text-xs font-bold text-slate-700 mt-1 capitalize">
                        {getDifficultyLabel(selectedExercise.difficulty)}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Mecánica</p>
                      <p className="text-xs font-bold text-slate-700 mt-1 capitalize">
                        {selectedExercise.mechanic ? formatText(selectedExercise.mechanic) : 'Compuesto'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Fuerza</p>
                      <p className="text-xs font-bold text-slate-700 mt-1 capitalize">
                        {selectedExercise.forceType ? formatText(selectedExercise.forceType) : 'Push'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Equipamiento</p>
                      <p className="text-xs font-bold text-slate-700 mt-1 capitalize">
                        {selectedExercise.equipment ? formatText(selectedExercise.equipment) : 'Peso Corporal'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Gasto MET</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {selectedExercise.met || '6.0'} <span className="text-[10px] text-slate-400 font-normal">kcal/kg/h</span>
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Tipo de Set</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {selectedExercise.isTimeBased ? 'Por Tiempo' : 'Repeticiones'}
                      </p>
                    </div>
                  </div>

                  {/* Músculos */}
                  <div className="space-y-3 pt-2">
                    {selectedExercise.primaryMuscles && (
                      <div>
                        <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Músculos Primarios</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedExercise.primaryMuscles.split(',').map(m => (
                            <span key={m} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg text-xs font-semibold">
                              {formatText(m)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedExercise.secondaryMuscles && (
                      <div>
                        <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Músculos Secundarios</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedExercise.secondaryMuscles.split(',').map(m => (
                            <span key={m} className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg text-xs font-semibold">
                              {formatText(m)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-4 text-center">
                  {/* Foto de Portada Personalizada */}
                  {selectedExercise.customImageUrl ? (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-black">
                      <p className="text-[10px] bg-slate-900 text-slate-300 py-1.5 font-bold uppercase">Foto del Usuario</p>
                      <img 
                        src={getMediaUrl(selectedExercise.customImageUrl)} 
                        alt="Usuario" 
                        className="w-full max-h-48 object-contain mx-auto" 
                      />
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center">
                      <ImageIcon size={32} className="text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500 font-semibold">Sin imagen personalizada</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                        Puedes editar el ejercicio para añadir la URL de una foto haciendo el movimiento.
                      </p>
                    </div>
                  )}

                  {/* Video Personalizado */}
                  {selectedExercise.customVideoUrl ? (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-black">
                      <p className="text-[10px] bg-slate-900 text-slate-300 py-1.5 font-bold uppercase">Video de Ejecución</p>
                      <video 
                        src={getMediaUrl(selectedExercise.customVideoUrl)} 
                        controls 
                        className="w-full max-h-48 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center">
                      <Video size={32} className="text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500 font-semibold">Sin video personalizado</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                        Grábate o añade un video de YouTube/MP4 para ver tu postura.
                      </p>
                    </div>
                  )}

                  {/* Botón rápido para editar */}
                  <button
                    onClick={(e) => { setSelectedExercise(null); handleOpenEdit(selectedExercise, e); }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    <Edit2 size={14} /> Editar Contenido y Multimedia
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO DE CREACIÓN/EDICIÓN (MODAL) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="text-blue-500" size={18} />
                {editingEx ? 'Editar Ejercicio' : 'Crear Ejercicio Nuevo'}
              </h3>
              <button 
                onClick={() => { setIsFormOpen(false); setEditingEx(null); }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre (Español)</label>
                <input 
                  type="text" 
                  value={formData.nameEs}
                  onChange={(e) => setFormData({...formData, nameEs: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  placeholder="Ej. Rueda Abdominal"
                  required
                />
              </div>

              {/* Grupo Muscular & Dificultad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Grupo Muscular</label>
                  <select 
                    value={formData.bodyPart}
                    onChange={(e) => setFormData({...formData, bodyPart: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-xs"
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dificultad</label>
                  <select 
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-xs"
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>

              {/* Músculos Primarios y Secundarios */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Músculos Primarios</label>
                  <input 
                    type="text" 
                    value={formData.primaryMuscles}
                    onChange={(e) => setFormData({...formData, primaryMuscles: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                    placeholder="ej. rectus_abdominis"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Músculos Secundarios</label>
                  <input 
                    type="text" 
                    value={formData.secondaryMuscles}
                    onChange={(e) => setFormData({...formData, secondaryMuscles: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                    placeholder="ej. obliques"
                  />
                </div>
              </div>

              {/* Equipamiento y Tipo de Medición */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Equipamiento</label>
                  <select 
                    value={formData.equipment}
                    onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-xs"
                  >
                    <option value="body_only">Peso Corporal</option>
                    <option value="dumbbell">Mancuernas</option>
                    <option value="barbell">Barra</option>
                    <option value="ab_wheel">Rueda Abdominal</option>
                    <option value="kettlebell">Kettlebell</option>
                    <option value="machine">Máquina</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.isTimeBased}
                      onChange={(e) => setFormData({...formData, isTimeBased: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    ¿Por tiempo? (Segundos)
                  </label>
                </div>
              </div>

              {/* Instrucciones */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instrucciones (Línea por paso)</label>
                <textarea 
                  value={formData.instructionsEs}
                  onChange={(e) => setFormData({...formData, instructionsEs: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  placeholder="Arrodíllate en el suelo y agarra las asas...&#10;Activa el core y rueda lentamente...&#10;Regresa contrayendo abdominales..."
                />
              </div>

              {/* Consejos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Consejos de Seguridad</label>
                <textarea 
                  value={formData.tipsEs}
                  onChange={(e) => setFormData({...formData, tipsEs: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  placeholder="Mantén la columna neutral.&#10;No permitas dolor en la zona lumbar."
                />
              </div>

              {/* Multimedia Personalizada */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                  <Video size={14} className="text-blue-500" />
                  Multimedia Local o URL
                </h4>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Ruta/URL de Foto</label>
                  <input 
                    type="text" 
                    value={formData.customImageUrl}
                    onChange={(e) => setFormData({...formData, customImageUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-white"
                    placeholder="ej. uploads/mi_ejercicio.jpg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Ruta/URL de Video (MP4)</label>
                  <input 
                    type="text" 
                    value={formData.customVideoUrl}
                    onChange={(e) => setFormData({...formData, customVideoUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-white"
                    placeholder="ej. uploads/mi_ejercicio.mp4"
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 pt-2 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => { setIsFormOpen(false); setEditingEx(null); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-md"
                >
                  {editingEx ? 'Guardar Cambios' : 'Crear Ejercicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
