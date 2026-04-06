import React from 'react';
import { NavSection } from '../types';

interface BottomNavProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  items: { section: NavSection; icon: any; label: string }[];
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentSection, onNavigate, items }) => {
  return (
    <div className="fixed bottom-0 w-full max-w-md mx-auto bg-brand-card border-t border-gray-800 pb-safe pt-2 px-2 z-50 flex justify-between items-center shadow-[0_-5px_30px_rgba(217,4,41,0.3)]">
      {items.map((item) => {
        const isActive = currentSection === item.section;
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.section)}
            className={`relative flex-1 flex flex-col items-center justify-center p-2 transition-all duration-300 ${isActive ? '-translate-y-4' : ''}`}
          >
            {/* Strong Red Neon Glow Effect */}
            {isActive && (
              <div className="absolute inset-0 bg-brand-red rounded-full blur-xl opacity-60 scale-110 animate-pulse"></div>
            )}
            
            {/* Icon Container */}
            <div className={`relative z-10 p-3 rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-brand-dark border-2 border-brand-red text-brand-red shadow-[0_0_20px_#D90429]' 
                : 'text-gray-500 border-2 border-transparent'
            }`}>
              <item.icon size={isActive ? 26 : 22} strokeWidth={isActive ? 3 : 2} />
            </div>

            {/* Label */}
            <span className={`text-[10px] font-black mt-1.5 transition-colors z-10 uppercase tracking-widest ${isActive ? 'text-brand-red drop-shadow-[0_0_8px_rgba(217,4,41,0.8)] scale-110' : 'text-gray-600'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};