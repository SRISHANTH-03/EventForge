import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bg = 'bg-warm-surface border-border text-text-main';
          let Icon = Info;
          let iconColor = 'text-teal-muted';

          if (toast.type === 'success') {
            bg = 'bg-mint-soft border-forest/30 text-forest-dark';
            Icon = CheckCircle2;
            iconColor = 'text-forest';
          } else if (toast.type === 'error') {
            bg = 'bg-red-50 border-red-200 text-status-critical';
            Icon = AlertCircle;
            iconColor = 'text-status-critical';
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-50 border-amber-200 text-status-warning';
            Icon = AlertTriangle;
            iconColor = 'text-status-warning';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-card text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${bg}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 leading-snug">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-muted hover:text-text-main p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
