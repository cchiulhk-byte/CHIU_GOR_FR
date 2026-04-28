import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import messages from './local/index';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: {
      zh: ['zh-HK'],
      'zh-CN': ['zh-HK'],
      'zh-TW': ['zh-HK'],
      'zh-HK': ['zh-HK'],
      'zh_HK': ['zh-HK'],
      default: ['zh-HK'],
    },
    debug: false,
    supportedLngs: ['zh-HK', 'zh_HK', 'zh', 'zh-CN', 'zh-TW', 'en', 'fr'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    resources: messages,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;