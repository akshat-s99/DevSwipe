import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Import Bootstrap 5 CSS and JavaScript bundle
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorProvider>
  </StrictMode>,
);



