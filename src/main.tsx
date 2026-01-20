import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AutProvider } from './auth/AuthProvider.tsx';
import './index.css'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AutProvider>
        <App />
      </AutProvider>
    </BrowserRouter>
  </React.StrictMode>,
);