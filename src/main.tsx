import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Deshabilitar menú contextual (click derecho y toque largo) en toda la aplicación
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Registrar el Service Worker para soportar PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
      .catch(err => console.error('Fallo al registrar Service Worker:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
