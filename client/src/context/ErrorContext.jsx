import React, { createContext, useState, useContext } from 'react';

// Create the Error Context
const ErrorContext = createContext(null);

/**
 * Custom hook to trigger error alerts, success toasts, and spinners globally.
 */
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

/**
 * ErrorProvider Component
 * Manages toast arrays, custom retry event hooks, and fullscreen loaders.
 */
export const ErrorProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  /**
   * Adds a new toast alert to the stack.
   * Auto-removes after 5 seconds unless a retry handler is specified.
   */
  const showToast = (message, type = 'danger', onRetry = null) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, onRetry };
    
    setToasts((prev) => [...prev, newToast]);

    // If it's not a retry error, auto-dismiss after 5 seconds
    if (!onRetry) {
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    }
  };

  /**
   * Dismisses a toast from the active view list.
   */
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ErrorContext.Provider
      value={{
        showError: (msg, onRetry) => showToast(msg, 'danger', onRetry),
        showSuccess: (msg) => showToast(msg, 'success'),
        showInfo: (msg) => showToast(msg, 'info'),
        setGlobalLoading,
        globalLoading
      }}
    >
      {children}

      {/* Floating Toast Notification Containers */}
      <div 
        className="position-fixed bottom-0 end-0 p-3" 
        style={{ zIndex: 1100, maxWidth: '400px', width: '100%' }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast show border-0 rounded-3 mb-2 shadow p-3 ${
              toast.type === 'success'
                ? 'bg-success text-white'
                : toast.type === 'info'
                ? 'bg-info text-white'
                : 'bg-danger text-white'
            }`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="toast-body p-0 fw-semibold">
                {toast.message}
              </div>
              <div className="d-flex align-items-center gap-2 ms-2">
                {toast.onRetry && (
                  <button
                    type="button"
                    className="btn btn-light btn-sm fw-bold px-3 text-dark"
                    onClick={() => {
                      toast.onRetry();
                      removeToast(toast.id);
                    }}
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => removeToast(toast.id)}
                ></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Screen Loading Backdrop Overlay */}
      {globalLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{
            zIndex: 2000,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div className="spinner-border text-primary" role="status" style={{ width: '3.5rem', height: '3.5rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary mt-3 fw-bold tracking-wider">PLEASE WAIT...</p>
        </div>
      )}
    </ErrorContext.Provider>
  );
};
