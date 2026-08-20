/**
 * Reads back what the published privacy policy claims about third-party hosts.
 *
 * The audit deliberately reads the *rendered page* rather than importing the
 * register from `src/i18n/legal.ts`. Importing the source would prove that the
 * data matches the data. Reading the page proves that what a visitor can
 * actually see matches what the site actually does — which is the promise the
 * policy makes, and the only one worth testing.
 *
 * The page carries `data-host` and `data-host-status` on the list it renders in
 * its technical-detail section. Those attributes are a published contract, not
 * incidental markup: the hostnames are visible to the reader beside them.
 */

const attribute = (tag, name) => {
  const match = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`).exec(tag);
  return match ? (match[2] ?? match[3] ?? '') : null;
};

/**
 * @returns {{active: string[], planned: string[], explicitlyNone: boolean}}
 */
export function declaredHosts(html) {
  const buckets = { active: new Set(), planned: new Set(), 'pre-launch': new Set() };

  for (const match of html.matchAll(/<[a-z]+\b[^>]*\bdata-host\s*=[^>]*>/gi)) {
    const tag = match[0];
    const host = attribute(tag, 'data-host');
    if (!host) continue;
    const status = attribute(tag, 'data-host-status') ?? 'active';
    (buckets[status] ?? buckets.active).add(host.trim());
  }

  return {
    active: [...buckets.active].sort(),
    planned: [...buckets.planned].sort(),
    /** Contacted today, not approved, must be gone before launch. */
    preLaunch: [...buckets['pre-launch']].sort(),
    // The page states in machine-readable form that it contacts nothing, which is
    // a different claim from having simply forgotten to render the list.
    explicitlyNone: /\bdata-hosts-none\b/i.test(html),
  };
}
