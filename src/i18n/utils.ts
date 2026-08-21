import { defaultLang, type Lang, languages, translations, type UiKey, ui } from './ui';

export type { Lang };

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in languages) return lang as Lang;
  return defaultLang;
}

/**
 * The translator for one language, falling back to French key by key.
 *
 * Callers pass the language actually **served**, not the one the visitor asked
 * for. A page that has fallen back renders entirely in French rather than a
 * half-translated mixture — see ./fallback.ts, which makes that decision once
 * per page.
 */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return translations[lang][key] ?? ui[defaultLang][key];
  };
}

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (path === '/') return base === '' ? '/' : `${base}/`;
  return `${base}${path}`;
}
