import { defaultLang, type Lang, ui } from './ui';

export type { Lang };

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

// Pages internes ayant une version EN. Toute autre route fallback sur FR.
const enRoutes = new Set<string>(['/']);

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (path === '/') return base === '' ? '/' : `${base}/`;
  return `${base}${path}`;
}

export function localizedPath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return withBase(clean);
  // Pour les pages sans traduction EN, on renvoie sur la version FR.
  if (!enRoutes.has(clean)) return withBase(clean);
  return withBase(`/${lang}${clean}`);
}
