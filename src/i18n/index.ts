import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { setDateLocale } from '@/lib/date'

import en from './en.json'
import ru from './ru.json'
import uz from './uz.json'

export const LANGS = [
  { code: 'uz', short: 'UZ', label: 'O‘zbekcha' },
  { code: 'ru', short: 'RU', label: 'Русский' },
  { code: 'en', short: 'EN', label: 'English' },
] as const

export type Lang = (typeof LANGS)[number]['code']

const LANG_KEY = 'acadium.lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'uz' || saved === 'ru' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  return 'uz'
}

void i18n.use(initReactI18next).init({
  resources: { uz: { translation: uz }, ru: { translation: ru }, en: { translation: en } },
  lng: initialLang(),
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
  returnNull: false,
})

function applyLang(lng: string) {
  document.documentElement.lang = lng
  setDateLocale(lng)
}
applyLang(i18n.language)

i18n.on('languageChanged', (lng) => {
  applyLang(lng)
  try {
    localStorage.setItem(LANG_KEY, lng)
  } catch {
    /* ignore */
  }
})

export default i18n
