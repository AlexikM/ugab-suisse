/**
 * Finds anything in the build output that would put data in a visitor's browser.
 *
 * Reads — `localStorage.getItem`, `document.cookie === ''`, feature detection —
 * are not flagged. What matters is what gets *stored*, because that is what turns
 * into a consent question and a disclosure. `removeItem` and `clear` are
 * mutations rather than writes, but nothing removes what it never set, so they
 * are worth surfacing too.
 */

/**
 * `ASSIGN` is an assignment, not a comparison. Without the lookarounds,
 * `if (document.cookie === "")` — a read — is reported as a write, and the audit
 * cries wolf about the one thing it exists to be trusted on.
 */
const ASSIGN = String.raw`(?<![=!<>])=(?!=)`;

const WRITES = [
  { api: 'document.cookie', pattern: new RegExp(String.raw`document\s*\.\s*cookie\s*${ASSIGN}`, 'g') },
  {
    api: 'localStorage.setItem',
    pattern: new RegExp(String.raw`localStorage\s*(?:\.\s*setItem\s*\(|\[[^\]]+\]\s*${ASSIGN})`, 'g'),
  },
  {
    api: 'sessionStorage.setItem',
    pattern: new RegExp(String.raw`sessionStorage\s*(?:\.\s*setItem\s*\(|\[[^\]]+\]\s*${ASSIGN})`, 'g'),
  },
  { api: 'localStorage.removeItem', pattern: /localStorage\s*\.\s*removeItem\s*\(/g },
  { api: 'localStorage.clear', pattern: /localStorage\s*\.\s*clear\s*\(/g },
  { api: 'indexedDB.open', pattern: /indexedDB\s*\.\s*open\s*\(/g },
  { api: 'caches.open', pattern: /\bcaches\s*\.\s*open\s*\(/g },
  // `.estimate()` is a read; `.persist()` asks to keep stored data around.
  { api: 'navigator.storage.persist', pattern: /navigator\s*\.\s*storage\s*\.\s*persist\s*\(/g },
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
