import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGS, LANG_LABELS, LANG_FLAGS, type SupportedLang } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = (lang as SupportedLang) || (i18n.language as SupportedLang) || 'en';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newLang: SupportedLang) => {
    setOpen(false);
    i18n.changeLanguage(newLang);
    const pathWithoutLang = location.pathname.replace(/^\/(en|ko|ja|vi|ru)/, '') || '/';
    navigate(`/${newLang}${pathWithoutLang}${location.search}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm"
      >
        <Globe size={16} />
        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
          {LANG_FLAGS[currentLang]} {currentLang.toUpperCase()}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {SUPPORTED_LANGS.map((code) => (
            <button
              key={code}
              onClick={() => handleSelect(code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                currentLang === code
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-base">{LANG_FLAGS[code]}</span>
              <span className="font-medium">{LANG_LABELS[code]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
