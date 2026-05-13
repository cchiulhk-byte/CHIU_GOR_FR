import React from 'react';
import { tokens } from '../tokens';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  type = 'button'
}) => {
  const baseStyles = "px-6 py-2.5 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#CC0000] to-[#FF3333] text-white shadow-lg shadow-red-500/20",
    secondary: "bg-gradient-to-r from-teal to-[#38B2AC] text-white shadow-lg shadow-teal-500/20",
    outline: "border-2 border-[#D4C8BC]/60 dark:border-[#3B2060]/60 text-[#4A4440] dark:text-[#C4A8E8] hover:bg-coral hover:text-white hover:border-coral",
    ghost: "bg-transparent text-[#7A7068] dark:text-[#B89FD8] hover:bg-coral/5 hover:text-coral",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{ fontFamily: tokens.typography.fontFamily }}
    >
      {children}
    </button>
  );
};
