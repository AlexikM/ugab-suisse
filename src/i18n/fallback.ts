/**
 * What language a page is actually in, as opposed to the one its URL claims.
 *
 * The site is trilingual by construction and Armenian by instalments: every
 * route exists at `/hy/…` from the day the locale is added, but the words
 * arrive when the Comité delivers them (#9). Something has to decide what a
 * visitor sees in between, and the decision must be the same on every page.
 *
 * The rule: **a page is in a language when every string it renders exists in
 * that language.** Otherwise it serves French and says so. Half a page in
 * Armenian and half in French would be worse than either — it reads as broken
 * rather than as honest.
 *
 * The consequence, which is the point: the Comité can finish one page at a
 * time. Paste the `home.*` keys into `armenian` in ./ui.ts and the Armenian
 * home page appears, on its own, while the rest of the site keeps falling back.
 * No developer, no restructuring, no deploy checklist.
 */

import { isLegalLang } from './legal';
import { defaultLang, type Lang, translations, type UiKey, ui } from './ui';
import { useTranslations } from './utils';

/**
 * The parts of the site a page can belong to. One per template, plus the
 * chrome every page carries.
 */
export type Section = 'home' | 'about' | 'events' | 'event' | 'donate' | 'contact' | 'legal';

/**
 * Key prefixes each section renders. Grouping by prefix rather than listing
 * every key means a new string added to a page is covered automatically: the
 * page starts falling back again until that string is translated too, which is
 * the honest answer.
 */
const SECTION_PREFIXES: Record<Section, readonly string[]> = {
  home: ['home.'],
  about: ['about.', 'bureau.'],
  events: ['events.', 'event.'],
  event: ['event.'],
  donate: ['donate.', 'sponsor.'],
  contact: ['contact.'],
  // The legal pages' own words are not in this table: they live in ./legal.ts,
  // in their own languages, because they are statements the association is
  // answerable for rather than interface copy. So the prefixes here cover the
  // chrome only, and `isTranslated` asks ./legal.ts about the other half.
  legal: [],
};

/** Header, footer and titles: rendered on every page, so required by all. */
const CHROME_PREFIXES = ['nav.', 'site.', 'footer.'] as const;

const allKeys = Object.keys(ui[defaultLang]) as UiKey[];

/** Every key belonging to one of these prefixes. */
export function keysFor(section: Section): UiKey[] {
  const prefixes = [...CHROME_PREFIXES, ...SECTION_PREFIXES[section]];
  return allKeys.filter((key) => prefixes.some((prefix) => key.startsWith(prefix)));
}

/** True when this language carries every string this section of the site needs. */
export function isTranslated(lang: Lang, section: Section): boolean {
  // Asked before the default-language shortcut so the rule reads in one place:
  // a legal page is in a language only if the legal copy exists in it, whatever
  // the interface strings say. The day Armenian chrome lands without Armenian
  // legal copy, the legal pages must keep falling back — the alternative is half
  // a page in each language, which is what this module exists to prevent.
  if (section === 'legal' && !isLegalLang(lang)) return false;
  if (lang === defaultLang) return true;
  const table = translations[lang];
  return keysFor(section).every((key) => typeof table[key] === 'string');
}

/** How many of a section's strings exist in a language. For the PR and the CMS. */
export function translationProgress(lang: Lang, section: Section): { done: number; total: number } {
  const keys = keysFor(section);
  const table = translations[lang];
  return {
    done: keys.filter((key) => typeof table[key] === 'string').length,
    total: keys.length,
  };
}

export interface PageLanguage {
  /** The language the URL asked for. What the switcher highlights. */
  requested: Lang;
  /** The language the page is actually written in. What `<html lang>` says. */
  served: Lang;
  /** True when the two differ, and the page has to say so out loud. */
  fellBack: boolean;
}

/**
 * Resolve one page. Pure, so a page and its layout can both call it and cannot
 * disagree about the answer.
 */
export function resolveLanguage(requested: Lang, section: Section): PageLanguage {
  const served = isTranslated(requested, section) ? requested : defaultLang;
  return { requested, served, fellBack: served !== requested };
}

/**
 * What a page needs at the top of its frontmatter: which language it is really
 * in, and a translator already pointed at it.
 *
 * Using `t` from here rather than `useTranslations(lang)` directly is what
 * keeps a page from rendering half in one language and half in another.
 */
export function pageContext(requested: Lang, section: Section) {
  const page = resolveLanguage(requested, section);
  return { ...page, t: useTranslations(page.served) };
}
