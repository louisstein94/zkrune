"use client";

/**
 * Touch-optimized button and interactive components
 */

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: TouchButtonProps) {
  const baseStyles = 'font-medium rounded-xl transition-all active:scale-95 touch-manipulation';
  
  const variantStyles = {
    primary: 'bg-zk-primary text-zk-darker hover:bg-zk-primary/90 shadow-lg shadow-zk-primary/20',
    secondary: 'border-2 border-zk-primary text-zk-primary hover:bg-zk-primary/10',
    ghost: 'text-zk-gray hover:text-zk-primary hover:bg-zk-primary/10',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface TouchCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  isPressable?: boolean;
}

export function TouchCard({
  children,
  onClick,
  className = '',
  isPressable = true,
}: TouchCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6
        ${isPressable ? 'active:scale-[0.98] cursor-pointer' : ''}
        ${onClick ? 'hover:border-zk-primary/50' : ''}
        transition-all touch-manipulation
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface TouchInputProps {
  label?: string;
  error?: string;
  helpText?: string;
}

export function TouchInput({
  label,
  error,
  helpText,
  className = '',
  ...props
}: TouchInputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 min-h-[48px]
          bg-zk-dark/30 border border-zk-gray/30 rounded-xl
          text-white placeholder:text-zk-gray
          focus:border-zk-primary focus:outline-none focus:ring-2 focus:ring-zk-primary/20
          transition-all touch-manipulation
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-zk-gray">{helpText}</p>
      )}
    </div>
  );
}

export function TouchTextarea({
  label,
  error,
  helpText,
  className = '',
  ...props
}: TouchInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 min-h-[120px]
          bg-zk-dark/30 border border-zk-gray/30 rounded-xl
          text-white placeholder:text-zk-gray
          focus:border-zk-primary focus:outline-none focus:ring-2 focus:ring-zk-primary/20
          transition-all touch-manipulation resize-vertical
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-zk-gray">{helpText}</p>
      )}
    </div>
  );
}

