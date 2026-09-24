import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variants = {
    primary: 'bg-forest hover:bg-forest-dark text-white border border-forest',
    secondary: 'bg-mint-soft hover:bg-mint-subtle text-forest-dark border border-border',
    outline: 'bg-transparent hover:bg-mint-subtle text-text-main border border-border',
    ghost: 'bg-transparent hover:bg-mint-subtle text-text-muted hover:text-text-main',
    danger: 'bg-status-critical hover:bg-red-800 text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: 'bg-warm-white text-text-muted border-border',
    success: 'bg-mint-soft text-forest-dark border-forest/30',
    warning: 'bg-amber-50 text-status-warning border-amber-200',
    critical: 'bg-red-50 text-status-critical border-red-200',
    info: 'bg-blue-50 text-status-info border-blue-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-warm-surface rounded-xl border border-border shadow-subtle p-5 ${
        hover ? 'hover:border-forest/40 hover:shadow-card transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-text-main/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative bg-warm-surface rounded-2xl border border-border shadow-lift w-full ${maxWidth} p-6 z-10`}
        role="dialog"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <h3 className="text-lg font-semibold text-text-main">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main text-lg font-bold p-1 leading-none rounded focus-ring"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Input = ({ label, error, helperText, id, className = '', ...props }) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 7);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text-main mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-warm-surface px-3 py-2 text-sm text-text-main placeholder-text-light border-border focus-ring transition-colors ${
          error ? 'border-status-critical focus:ring-status-critical' : 'hover:border-text-muted'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-status-critical">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
    </div>
  );
};

export const Select = ({ label, error, helperText, id, children, className = '', ...props }) => {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 7);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-text-main mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border bg-warm-surface px-3 py-2 text-sm text-text-main border-border focus-ring transition-colors ${
          error ? 'border-status-critical' : 'hover:border-text-muted'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-status-critical">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => {
  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-mint-subtle/50">
      {Icon && <Icon className="w-12 h-12 text-forest/60 mx-auto mb-3" />}
      <h3 className="text-base font-semibold text-text-main">{title}</h3>
      <p className="text-sm text-text-muted mt-1 max-w-md mx-auto">{description}</p>
      {actionText && onAction && (
        <div className="mt-4">
          <Button onClick={onAction} variant="primary">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-forest animate-spin" />
      <span className="text-sm font-medium text-text-muted">{text}</span>
    </div>
  );
};
