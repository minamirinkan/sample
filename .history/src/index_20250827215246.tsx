import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>    
      <AuthProvider> {/* ← Contextのグローバルラップ */}
            <App />
      </AuthProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.register();