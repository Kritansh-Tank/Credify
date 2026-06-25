'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm bg-white
            placeholder:text-slate-400 text-slate-900
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-colors duration-150
            ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 hover:border-slate-400'}
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-600 flex items-center gap-1">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={3}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm bg-white resize-none
            placeholder:text-slate-400 text-slate-900
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-colors duration-150
            ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 hover:border-slate-400'}
            disabled:bg-slate-50 disabled:text-slate-400
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
