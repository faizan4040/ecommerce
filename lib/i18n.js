'use client'

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Translation resources
const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      checkout: "Checkout",
      "Please choose your language or currency": "Please choose your language or currency",
    },
  },
  hi: {
    translation: {
      welcome: "स्वागत है",
      checkout: "चेकआउट",
      "Please choose your language or currency": "कृपया अपनी भाषा या मुद्रा चुनें",
    },
  },
  fr: {
    translation: {
      welcome: "Bienvenue",
      checkout: "Caisse",
      "Please choose your language or currency": "Veuillez choisir votre langue ou devise",
    },
  },
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false, // Important for Next.js client components
    },
  });

export default i18n;
