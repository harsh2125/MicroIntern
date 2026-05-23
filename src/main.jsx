import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider }  from './context/AuthContext.jsx';
import { Toaster }       from 'react-hot-toast';
import './index.css';

// Apply saved theme class to <html> BEFORE React renders
// This prevents a white flash on dark-mode users
(function() {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color:      '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #374151',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);