import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import ca from './locales/ca.json';
import en from './locales/en.json';

const savedLang = localStorage.getItem('i18nextLng') || 'es';

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, ca: { translation: ca }, en: { translation: en } },
  lng: savedLang,
  fallbackLng: 'es',
  interpolation: { escapeValue: false }
});

export default i18n;
