import React, { useState, useMemo } from 'react';
import { Bot, Copy, Check, ChevronDown, Sparkles, CalendarRange } from 'lucide-react';
import type { WorkoutSession } from '../types';
import chatgptIcon from '../assets/chatgpt-icon.svg';
import claudeIcon from '../assets/claude-ai-icon.svg';
import { ModalCard } from './ModalCard';

interface ShareToAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutHistory: WorkoutSession[];
}

type Period = 3 | 6 | 12;

const PERIODS: { value: Period; label: string }[] = [
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' },
];

const AI_PROVIDERS = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'Abre ChatGPT con tus datos pre-cargados',
    iconSrc: chatgptIcon,
    copyFirst: false,
    borderColor: 'border-[#10A37F]/40 hover:border-[#10A37F]',
    shadowColor: 'hover:shadow-[0_0_20px_rgba(16,163,127,0.3)]',
    url: (prompt: string) =>
      `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
  },
  {
    id: 'claude',
    name: 'Claude AI',
    description: 'Análisis detallado con la IA de Anthropic',
    iconSrc: claudeIcon,
    copyFirst: false,
    borderColor: 'border-[#D97757]/40 hover:border-[#D97757]',
    shadowColor: 'hover:shadow-[0_0_20px_rgba(217,119,87,0.3)]',
    url: (prompt: string) =>
      `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
];

function buildPrompt(sessions: WorkoutSession[], period: Period): string {
  const summary = {
    period: `Últimos ${period} meses`,
    totalWorkouts: sessions.length,
    totalVolumeKg: sessions.reduce((acc, s) => acc + (s.totalVolume || 0), 0),
    totalDurationMinutes: sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0),
    muscleGroupFrequency: sessions
      .flatMap((s) => s.muscleGroupsTrained)
      .reduce<Record<string, number>>((acc, mg) => {
        acc[mg] = (acc[mg] || 0) + 1;
        return acc;
      }, {}),
    workouts: sessions.map((s) => ({
      date: s.date,
      routine: s.routineName,
      durationMinutes: s.durationMinutes,
      totalVolumeKg: s.totalVolume,
      completedSets: s.completedSets,
      totalSets: s.totalSets,
      muscleGroupsTrained: s.muscleGroupsTrained,
      exercises: (s.exercises || []).map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
        })),
      })),
    })),
  };

  const json = JSON.stringify(summary, null, 2);

  return `Eres un experto en fitness y entrenamiento de fuerza. Analiza mis entrenamientos de los últimos ${period} meses y dame retroalimentación detallada sobre:

1. **Consistencia y frecuencia** de entrenamiento
2. **Progresión de volumen** (¿estoy mejorando?)
3. **Balance muscular** (¿entreno todos los grupos equitativamente?)
4. **Puntos fuertes** de mi rutina actual
5. **Áreas de mejora** concretas y accionables
6. **Recomendaciones personalizadas** para las próximas semanas

Aquí están mis datos de entrenamiento en JSON:

\`\`\`json
${json}
\`\`\`

Por favor, sé específico, usa los datos reales y dame consejos prácticos que pueda aplicar inmediatamente.`;
}

export const ShareToAIModal: React.FC<ShareToAIModalProps> = ({
  isOpen,
  onClose,
  workoutHistory,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(3);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filteredSessions = useMemo(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - selectedPeriod);
    return workoutHistory.filter((s) => new Date(s.date) >= cutoff);
  }, [workoutHistory, selectedPeriod]);

  const prompt = useMemo(
    () => buildPrompt(filteredSessions, selectedPeriod),
    [filteredSessions, selectedPeriod]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenAI = async (provider: typeof AI_PROVIDERS[number]) => {
    if (provider.copyFirst) {
      await navigator.clipboard.writeText(prompt);
      setToast(`Prompt copiado — pégalo en ${provider.name} con Ctrl+V / ⌘V`);
      setTimeout(() => setToast(null), 4000);
    }
    window.open(provider.url(prompt), '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  const totalVolume = filteredSessions.reduce((acc, s) => acc + (s.totalVolume || 0), 0);
  const totalDuration = filteredSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const modalTitle = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-black border border-slate-800 flex items-center justify-center flex-shrink-0">
        <img src={chatgptIcon} alt="ChatGPT" className="w-6 h-6 object-contain" />
      </div>
      <div>
        <h2 className="font-extrabold text-white text-base leading-tight">
          Share to AI
        </h2>
        <p className="text-[10px] font-medium text-slate-400">Análisis inteligente de tu rutina</p>
      </div>
    </div>
  );

  const modalFooter = (
    <div>
      <p className="text-center text-xs text-slate-500 font-medium mb-3">
        Enviar directamente a:
      </p>
      <div className="flex justify-center gap-8">
        {AI_PROVIDERS.map((provider) => (
          <div key={provider.id} className="flex flex-col items-center gap-2">
            <button
              id={`share-to-${provider.id}-btn`}
              aria-label={`Abrir en ${provider.name}`}
              onClick={() => handleOpenAI(provider)}
              disabled={filteredSessions.length === 0}
              className="w-16 h-16 flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed p-0 bg-transparent border-0 focus:outline-none"
            >
              <img
                src={provider.iconSrc}
                alt={provider.name}
                className="w-full h-full block object-contain"
              />
            </button>
            <span className="text-xs font-semibold text-slate-400">{provider.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] bg-slate-800 border border-violet-500/40 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300 whitespace-nowrap">
          <span>📋</span>
          {toast}
        </div>
      )}

      <ModalCard
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        footer={modalFooter}
      >
        {/* Period Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <CalendarRange size={13} className="text-violet-400" />
            Período de análisis
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PERIODS.map(({ value, label }) => (
              <button
                key={value}
                id={`period-btn-${value}`}
                onClick={() => setSelectedPeriod(value)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  selectedPeriod === value
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 border border-violet-400/40 scale-[1.02]'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats preview */}
        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/60 rounded-2xl p-4 shadow-inner">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-violet-400" />
              Resumen a exportar
            </span>
            <span className="text-[10px] text-slate-400 font-normal normal-case">
              Formato JSON estructurado
            </span>
          </p>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
              <span className="block text-xl font-black text-white">{filteredSessions.length}</span>
              <span className="text-[10px] font-semibold text-slate-400">Entrenos</span>
            </div>
            <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
              <span className="block text-xl font-black text-violet-400">{totalVolume.toLocaleString()}</span>
              <span className="text-[10px] font-semibold text-slate-400">kg totales</span>
            </div>
            <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
              <span className="block text-xl font-black text-cyan-400">{totalDuration}</span>
              <span className="text-[10px] font-semibold text-slate-400">minutos</span>
            </div>
          </div>

          {filteredSessions.length === 0 && (
            <p className="text-center text-slate-500 text-xs mt-3 italic">
              No hay entrenamientos registrados en este período
            </p>
          )}
        </div>

        {/* Prompt preview toggle */}
        <div className="border border-slate-700/60 rounded-2xl overflow-hidden bg-slate-900/50">
          <button
            id="share-ai-preview-toggle"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors text-xs font-bold text-slate-300"
          >
            <span className="flex items-center gap-2">
              <Bot size={15} className="text-violet-400" />
              Ver prompt completo de IA
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`}
            />
          </button>
          {showPreview && (
            <div className="bg-slate-950 border-t border-slate-800 p-3 max-h-44 overflow-y-auto">
              <pre className="text-[10px] text-slate-400 whitespace-pre-wrap font-mono leading-relaxed select-all">
                {prompt}
              </pre>
            </div>
          )}
        </div>

        {/* Copy button */}
        <button
          id="share-ai-copy-btn"
          onClick={handleCopy}
          disabled={filteredSessions.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 border border-slate-700/80 rounded-2xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/90 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check size={16} className="text-emerald-400" />
              <span className="text-emerald-400">¡Prompt Copiado al Portapapeles!</span>
            </>
          ) : (
            <>
              <Copy size={15} className="text-violet-400" />
              Copiar prompt manualmente
            </>
          )}
        </button>
      </ModalCard>
    </>
  );
};
