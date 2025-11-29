
import React, { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// --- WRAPPERS ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<CardProps> = ({ children, className = '', noPadding = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-slate-900/40 backdrop-blur-xl border border-white/10
        shadow-xl shadow-black/20
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:bg-slate-800/50 hover:border-white/20 hover:scale-[1.01] hover:shadow-2xl hover:shadow-solar-500/10' : ''}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
    >
      {/* Subtle Gradient Glow effect on top left */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-solar-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// --- BUTTONS ---

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const SolarButton: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-solar-600 to-solar-400 text-slate-900 shadow-lg shadow-solar-500/20 hover:shadow-solar-500/40 hover:brightness-110 border border-transparent",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-md",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// --- INPUTS ---

interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  textarea?: boolean;
}

export const GlassInput: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  textarea = false,
  ...props 
}) => {
  const inputStyles = `
    w-full bg-slate-950/30 text-white 
    border border-white/10 rounded-xl
    focus:border-solar-500/50 focus:ring-2 focus:ring-solar-500/20 focus:bg-slate-950/50
    placeholder-slate-500
    transition-all duration-200
    px-4 py-3
    ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">{label}</label>}
      {textarea ? (
        <textarea className={inputStyles} {...(props as any)} />
      ) : (
        <input className={inputStyles} {...props} />
      )}
      {error && <p className="mt-1 text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
};

// --- BADGES ---

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  className?: string;
}

export const SolarBadge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-solar-500/10 text-solar-400 border-solar-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm
      ${styles[variant]} ${className}
    `}>
      {children}
    </span>
  );
};

// --- PAGE HEADER ---

export const PageHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
    <div>
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
        {title}
      </h1>
      {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
