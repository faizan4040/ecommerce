'use client'

import { Globe2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const currencyMap = { en: "£", hi: "₹", fr: "€" };

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language || "en");
  const [isI18nReady, setIsI18nReady] = useState(false);
  const langRef = useRef(null);

  // Wait until i18n is initialized
  useEffect(() => {
    if (i18n && i18n.isInitialized) {
      setIsI18nReady(true);
    } else {
      // Poll every 50ms until initialized
      const interval = setInterval(() => {
        if (i18n.isInitialized) {
          setIsI18nReady(true);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [i18n]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangeLanguage = (lang) => {
    if (isI18nReady && i18n && typeof i18n.changeLanguage === "function") {
      i18n.changeLanguage(lang);
      setSelectedLang(lang);
      setLangOpen(false);
    } else {
      console.warn("i18n not ready yet");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setLangOpen(!langOpen)}
        className="flex items-center gap-1.5 text-sm hover:underline"
      >
        <Globe2 size={16} />
        <span>{selectedLang.toUpperCase()} {currencyMap[selectedLang]}</span>
      </button>

      {langOpen && (
        <div
          ref={langRef}
          className="absolute right-0 top-14 z-50 w-80 bg-white text-black rounded-2xl shadow-xl border p-6"
        >
          <h4 className="text-xs font-semibold mb-4">
            {t("Please choose your language or currency")}
          </h4>

          <select
            className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
            value={selectedLang}
            onChange={(e) => handleChangeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="fr">French</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
