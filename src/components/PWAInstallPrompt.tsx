import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      setIsVisible(true);
    };

    const handleCustomPrompt = (e: any) => {
      setDeferredPrompt(e.detail);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handleCustomPrompt);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone;
    
    if (isStandalone) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handleCustomPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostrar el prompt de instalación nativo
    deferredPrompt.prompt();
    
    // Esperar la elección del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Elección de instalación PWA: ${outcome}`);
    
    // Limpiar el prompt guardado y ocultar banner
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-28 left-4 right-4 z-[9999] max-w-md mx-auto bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
          <Download size={20} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">¿Descargar GymRoutine?</h4>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
            Agrega el acceso directo para usar en pantalla completa y sin internet.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Cerrar"
        >
          <X size={16} />
        </button>
        <button
          onClick={handleInstallClick}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-blue-600/30 active:scale-95 flex items-center gap-1"
        >
          Instalar
        </button>
      </div>
    </div>
  );
};
