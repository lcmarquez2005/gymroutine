import React from 'react';
import { Share2 } from 'lucide-react';
import chatgptIcon from '../assets/chatgpt-icon.svg';

interface ShareToAIButtonProps {
  onClick: () => void;
  variant?: 'pill' | 'banner' | 'compact' | 'glowing';
  className?: string;
  disabled?: boolean;
}

export const ShareToAIButton: React.FC<ShareToAIButtonProps> = ({
  onClick,
  variant = 'banner',
  className = '',
  disabled = false,
}) => {
  if (variant === 'banner') {
    return (
      <div
        id="share-to-ai-card-banner"
        onClick={onClick}
        className={`w-full group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-black border border-slate-800 flex items-center justify-center flex-shrink-0">
            <img
              src={chatgptIcon}
              alt="ChatGPT"
              className="w-7 h-7 object-contain"
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm tracking-tight">
              Share to AI
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
              Analiza tus entrenamientos con ChatGPT o Claude
            </p>
          </div>
        </div>

        {/* Botón Cuadrado Redondeado Negro Mate (Solo Icono, Sin Texto) */}
        <button
          type="button"
          disabled={disabled}
          aria-label="Compartir con IA"
          className="w-11 h-11 rounded-2xl bg-black hover:bg-slate-950 text-white border border-slate-800 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
        >
          <Share2 size={18} className="text-slate-200" />
        </button>
      </div>
    );
  }

  if (variant === 'glowing') {
    return (
      <button
        id="share-to-ai-btn"
        onClick={onClick}
        disabled={disabled}
        className={`group relative px-4 py-3 rounded-2xl bg-black border border-slate-800 text-white text-xs font-bold active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 ${className}`}
      >
        <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
          <img src={chatgptIcon} alt="ChatGPT" className="w-5 h-5 object-contain" />
        </div>
        <span className="font-bold text-sm text-white">Share to AI</span>
        <Share2 size={16} className="text-slate-300" />
      </button>
    );
  }

  // Default / Pill variant (Matte Black square-ish button)
  return (
    <button
      id="share-to-ai-btn"
      onClick={onClick}
      disabled={disabled}
      className={`w-11 h-11 rounded-2xl bg-black hover:bg-slate-950 text-white border border-slate-800 active:scale-95 transition-all duration-200 flex items-center justify-center ${className}`}
      aria-label="Share to AI"
    >
      <img src={chatgptIcon} alt="ChatGPT" className="w-6 h-6 object-contain" />
    </button>
  );
};
