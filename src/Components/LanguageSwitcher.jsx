import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const dropdownRef = useRef(null);

  const languages = [
    { code: "en", label: "EN", full: "English" },
    { code: "fr", label: "FR", full: "Français" },
    { code: "ar", label: "AR", full: "العربية" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState(
    localStorage.getItem("language") || i18n.language || "en",
  );

  useEffect(() => {
    i18n.changeLanguage(lang).then(() => {
      localStorage.setItem("language", lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      setIsOpen(false);
    });
  }, [lang]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-800/60 hover:bg-gray-700/80 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
      >
        <span className="font-bold text-sm tracking-wider">
          {currentLang.label}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {/* 
        On mobile, we position the menu to be more visible. 
        We use bottom-full mb-2 to make it open UPWARDS on mobile if needed, 
        or just ensure enough z-index.
      */}
      <div
        className={`absolute z-[999] w-32 rounded-xl bg-gray-900/95 backdrop-blur-md border border-gray-700 shadow-2xl transition-all duration-200 
        ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 visible"
            : "opacity-0 scale-95 -translate-y-2 invisible"
        } 
        ${i18n.language === "ar" ? "left-0 origin-top-left" : "right-0 origin-top-right"}
        md:top-full md:mt-2
        max-md:bottom-full max-md:mb-2`}
      >
        <div className="py-1.5 px-1">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                i18n.language === l.code
                  ? "bg-green-600/20 text-green-400 font-bold"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{l.full}</span>
              <span className="text-[10px] opacity-50 font-mono">
                {l.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
