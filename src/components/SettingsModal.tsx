import React, { useRef, useState, useEffect } from 'react';
import { X, Globe, User, Volume2, Palette, Type, Eye, Zap } from 'lucide-react';
import { AppSettings, Language } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'hi' as Language, name: 'Hindi', flag: '🇮🇳', native: 'हिंदी' },
    { code: 'te' as Language, name: 'Telugu', flag: '🏛️', native: 'తెలుగు' },
    { code: 'ta' as Language, name: 'Tamil', flag: '🏛️', native: 'தமிழ்' },
    { code: 'kn' as Language, name: 'Kannada', flag: '🏛️', native: 'ಕನ್ನಡ' },
    { code: 'ml' as Language, name: 'Malayalam', flag: '🏛️', native: 'മലയാളം' },
    { code: 'gu' as Language, name: 'Gujarati', flag: '🏛️', native: 'ગુજરાતી' },
    { code: 'bn' as Language, name: 'Bengali', flag: '🏛️', native: 'বাংলা' }
  ];

  const themes = [
    { id: 'default', name: 'Default', colors: ['#8B5CF6', '#EC4899'], emoji: '🌈' },
    { id: 'ocean', name: 'Ocean', colors: ['#3B82F6', '#06B6D4'], emoji: '🌊' },
    { id: 'forest', name: 'Forest', colors: ['#10B981', '#34D399'], emoji: '🌲' },
    { id: 'sunset', name: 'Sunset', colors: ['#F59E0B', '#EF4444'], emoji: '🌅' },
    { id: 'space', name: 'Space', colors: ['#6366F1', '#8B5CF6'], emoji: '🚀' }
  ];

const cardClass = (selected: boolean) =>
  `flex flex-col items-center justify-center min-w-[110px] max-w-[120px] p-3 rounded-2xl border-2 transition-all duration-200 text-center flex-shrink-0 mx-2 my-2 bg-white ${selected ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'}`;

  const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string }> = ({ enabled, onChange, label }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400
        ${enabled ? 'bg-purple-500' : 'bg-gray-300'}
      `}
      aria-label={label}
    >
      <div className={`
        absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-200 shadow-md
        ${enabled ? 'translate-x-7' : 'translate-x-0'}
      `} />
    </button>
  );

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const themeRowRef = useRef<HTMLDivElement>(null);
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);
  const [showLangScrollLeft, setShowLangScrollLeft] = useState(false);
  const [showLangScrollRight, setShowLangScrollRight] = useState(false);
  const langRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocalSettings(settings); }, [settings, isOpen]);

  const checkScroll = () => {
    const el = themeRowRef.current;
    if (el) {
      setShowScrollLeft(el.scrollLeft > 10);
      setShowScrollRight(el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }
  };
  const scrollRight = () => { const el = themeRowRef.current; if (el) { el.scrollBy({ left: 200, behavior: 'smooth' }); setTimeout(checkScroll, 300); } };
  const scrollLeft = () => { const el = themeRowRef.current; if (el) { el.scrollBy({ left: -200, behavior: 'smooth' }); setTimeout(checkScroll, 300); } };
  const checkLangScroll = () => { const el = langRowRef.current; if (el) { setShowLangScrollLeft(el.scrollLeft > 10); setShowLangScrollRight(el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 10); } };
  const scrollLangRight = () => { const el = langRowRef.current; if (el) { el.scrollBy({ left: 200, behavior: 'smooth' }); setTimeout(checkLangScroll, 300); } };
  const scrollLangLeft = () => { const el = langRowRef.current; if (el) { el.scrollBy({ left: -200, behavior: 'smooth' }); setTimeout(checkLangScroll, 300); } };

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings({ ...localSettings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 p-6 z-20" style={{ minHeight: '72px' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Settings ⚙️</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close settings">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-10 pt-2" style={{ marginTop: '8px' }}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-2">
              <Globe className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Language</h3>
            </div>
            <div className="relative mt-2">
              <div ref={langRowRef} onScroll={checkLangScroll} className="flex flex-nowrap justify-start gap-2 py-1 px-1 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch', overflowX: 'auto' }}>
              {languages.map((lang) => (
                  <button key={lang.code} onClick={() => handleSettingChange('language', lang.code)} className={cardClass(localSettings.language === lang.code)}>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-base truncate" title={lang.name}>{lang.name}</div>
                        <div className="text-xs opacity-70 truncate" title={lang.native}>{lang.native}</div>
                      </div>
                    </div>
                  </button>
                ))}
                  </div>
              {showLangScrollLeft && (
                <button onClick={scrollLangLeft} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-purple-200 rounded-full shadow p-2 hover:bg-purple-50 transition-all" style={{ zIndex: 2 }} aria-label="Scroll languages left">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              {showLangScrollRight && (
                <button onClick={scrollLangRight} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-purple-200 rounded-full shadow p-2 hover:bg-purple-50 transition-all" style={{ zIndex: 2 }} aria-label="Scroll languages right">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </div>
          <div className="space-y-4 mt-8">
            <div className="flex items-center space-x-3 mb-2">
              <Palette className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Theme</h3>
            </div>
            <div className="relative mt-12">
              <div ref={themeRowRef} onScroll={checkScroll} className="flex flex-nowrap justify-start gap-2 py-1 px-1 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch', overflowX: 'auto' }}>
              {themes.map((theme) => (
                  <button key={theme.id} onClick={() => handleSettingChange('theme', theme.id)} className={cardClass(localSettings.theme === theme.id)}>
                    <div className="text-xl mb-1">{theme.emoji}</div>
                    <div className="font-semibold text-base truncate" title={theme.name}>{theme.name}</div>
                    <div className="flex justify-center space-x-1 mt-1">
                    {theme.colors.map((color, index) => (
                        <div key={index} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              {showScrollLeft && (
                <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-purple-200 rounded-full shadow p-2 hover:bg-purple-50 transition-all" style={{ zIndex: 2 }} aria-label="Scroll themes left">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              {showScrollRight && (
                <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-purple-200 rounded-full shadow p-2 hover:bg-purple-50 transition-all" style={{ zIndex: 2 }} aria-label="Scroll themes right">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-2">
              <Eye className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Accessibility</h3>
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
                <div className="flex space-x-3">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                  <button key={size} onClick={() => handleSettingChange('fontSize', size)} className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 capitalize ${localSettings.fontSize === size ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300'}`}>
                      <Type className="w-4 h-4 mx-auto mb-1" />
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-800">Voice Responses</h4>
                      <p className="text-sm text-gray-600">Enable audio playback for responses</p>
                    </div>
                  </div>
              <ToggleSwitch enabled={localSettings.voiceEnabled} onChange={(enabled) => handleSettingChange('voiceEnabled', enabled)} label="Toggle voice responses" />
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white rounded-b-3xl border-t border-gray-100 p-6">
          <button onClick={() => { onSettingsChange(localSettings); onClose(); }} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl">Save Settings ✨</button>
        </div>
      </div>
    </div>
  );
};