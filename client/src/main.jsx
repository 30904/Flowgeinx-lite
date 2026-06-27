import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('[PWA] App ready to work offline');
  },
  onNeedRefresh() {
    console.info('[PWA] New version available — refresh to update');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
