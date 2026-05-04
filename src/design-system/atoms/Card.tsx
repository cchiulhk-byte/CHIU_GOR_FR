import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isGlass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', isGlass = false }) => {
  const baseStyles = "rounded-[2.5rem] border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 transition-all duration-500 overflow-hidden";
  const glassStyles = "bg-white/70 dark:bg-[#1E0D38]/60 backdrop-blur-2xl";
  const solidStyles = "bg-white dark:bg-[#1E0D38]";

  return (
    <div className={`${baseStyles} ${isGlass ? glassStyles : solidStyles} ${className}`}>
      {children}
    </div>
  );
};
