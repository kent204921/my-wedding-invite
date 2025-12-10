import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  currentLang: Language;
  onToggle: (lang: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang, onToggle }) => {
  return (
    <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-full border border-rose-200 shadow-sm">
      <button
        onClick={() => onToggle('zh')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
          currentLang === 'zh'
            ? 'bg-rose-500 text-white shadow-md'
            : 'text-rose-800 hover:bg-rose-100'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => onToggle('en')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
          currentLang === 'en'
            ? 'bg-rose-500 text-white shadow-md'
            : 'text-rose-800 hover:bg-rose-100'
        }`}
      >
        English
      </button>
    </div>
  );
};

export default LanguageToggle;