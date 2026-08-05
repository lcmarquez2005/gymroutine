import React from 'react';
import { X } from 'lucide-react';

interface ModalCardProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  hideHeader?: boolean;
}

export const ModalCard: React.FC<ModalCardProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  headerClassName,
  bodyClassName = 'p-5 space-y-4',
  hideHeader = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 pb-28 sm:pb-4">
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal encuadre único reutilizable para toda la app */}
      <div className="relative bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[72vh] sm:max-h-[78vh] animate-in zoom-in-95 duration-200 z-10">
        
        {/* Header */}
        {!hideHeader && (
          <div className={`p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 flex-shrink-0 ${headerClassName || ''}`}>
            <div className="font-bold text-white flex items-center gap-1.5">
              {title}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
