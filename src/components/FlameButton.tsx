import React from 'react';
import { Flame } from 'lucide-react';

interface FlameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  iconSize?: number;
}

export const FlameButton: React.FC<FlameButtonProps> = ({ 
  label, 
  variant = 'primary', 
  iconSize = 14,
  className = '',
  ...props 
}) => {
  // Base: 3D effect (border-b-4), Neon Glow, rounded
  let baseClasses = "group relative flex items-center justify-center gap-2 rounded-full px-5 py-3 font-suez text-xs transition-all active:scale-95 active:border-b-0 active:translate-y-1 shadow-[0_0_15px_rgba(217,4,41,0.4)] hover:shadow-[0_0_25px_rgba(217,4,41,0.8)] border-b-4 duration-150";
  
  const variants = {
    // Primary: Brand Red, 3D effect darker red
    primary: "bg-brand-red border-red-900 text-white",
    // Secondary: Dark Card, 3D effect gray
    secondary: "bg-brand-card border-gray-800 text-white hover:bg-gray-800",
    // Danger: Black, 3D effect red
    danger: "bg-black text-red-500 border-red-900 hover:bg-gray-900"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      <div className="bg-black/20 p-1.5 rounded-full group-hover:scale-110 transition-transform">
        <Flame size={iconSize} className="text-brand-yellow fill-brand-yellow drop-shadow-[0_0_5px_rgba(255,183,3,0.8)]" />
      </div>
      <span className="tracking-wider font-bold drop-shadow-md">{label}</span>
      
      {/* Neon Overlay */}
      <div className="absolute inset-0 rounded-full ring-1 ring-white/20 pointer-events-none"></div>
    </button>
  );
};