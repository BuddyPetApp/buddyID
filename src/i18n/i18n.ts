import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './pt';
import en from './en';

const resources = {
  pt,
  en
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
