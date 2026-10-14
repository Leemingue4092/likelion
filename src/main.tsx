import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root');
if (root) createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const host = location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => undefined);
    });
  }
}
