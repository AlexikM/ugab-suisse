/**
 * Finds anything in the build output that would put data in a visitor's browser.
 *
 * Reads only — `localStorage.getItem`, feature detection — are not flagged. What
 * matters is what gets *stored*, because that is what turns into a consent
 * question and a disclosure.
 */

const WRITES = [
  { api: 'document.cookie', pattern: /document\s*\.\s*cookie\s*=/g },
  { api: 'localStorage.setItem', pattern: /localStorage\s*(?:\.\s*setItem\s*\(|\[[^\]]+\]\s*=)/g },
  { api: 'sessionStorage.setItem', pattern: /sessionStorage\s*(?:\.\s*setItem\s*\(|\[[^\]]+\]\s*=)/g },
  { api: 'localStorage.removeItem', pattern: /localStorage\s*\.\s*(?:removeItem|clear)\s*\(/g },
  { api: 'indexedDB.open', pattern: /indexedDB\s*\.\s*open\s*\(/g },
  { api: 'caches.open', pattern: /\bcaches\s*\.\s*open\s*\(/g },
  { api: 'navigator.storage', pattern: /navigator\s*\.\s*storage\b/g },
  { api: 'serviceWorker.register', pattern: /serviceWorker\s*\.\s*register\s*\(/g },
];

const around = (source, index) =>
  source
    .slice(Math.max(0, index - 40), index + 60)
    .replace(/\s+/g, ' ')
    .trim();

/**
 * @returns {Array<{api: string, snippet: string}>}
 */
export function storageWrites(source) {
  const found = [];
  for (const { api, pattern } of WRITES) {
    for (const match of source.matchAll(pattern)) {
      found.push({ api, snippet: around(source, match.index) });
    }
  }
  return found;
}

/**
 * Signs of a consent dialogue in rendered HTML. Matched on the accessible role
 * and the words a visitor would read, not on class names or element nesting —
 * a banner restyled or renamed is still a banner.
 */
export const CONSENT_DIALOGUE_MARKERS = [
  /role\s*=\s*"dialog"[^>]*aria-label\s*=\s*"[^"]*(?:cookie|consent|consentement)/i,
  /aria-label\s*=\s*"[^"]*(?:cookie|consent|consentement)[^"]*"[^>]*role\s*=\s*"dialog"/i,
  /<button[^>]*>\s*(?:Accepter|Accept|Tout accepter|Accept all)\s*<\/button>/i,
  /<button[^>]*>\s*(?:Refuser|Decline|Reject|Tout refuser)\s*<\/button>/i,
];
