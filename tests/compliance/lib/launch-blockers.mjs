/**
 * Third parties the built site contacts today that nobody agreed to, and that
 * this workstream cannot remove because the file introducing each one belongs to
 * another workstream in flight.
 *
 * This is not an allowlist. An allowlist says "this is fine". Every entry here
 * says the opposite: it is a defect, it has an owner, and it blocks launch. It
 * exists so the audit can stay green for work that is genuinely compliant while
 * still counting what is not, instead of a red suite that everyone learns to
 * ignore.
 *
 * Removing an entry is the whole job. When the list is empty, delete the `todo`
 * marker on the last test in `third-party-requests.test.mjs` and delete this file.
 */

/**
 * @typedef {object} Blocker
 * @property {string} host        Hostname contacted.
 * @property {string} introducedBy Source file that introduces it.
 * @property {string} owner       Which workstream owns that file.
 * @property {string} effect      What the visitor's browser actually hands over.
 * @property {string} fix         What has to change.
 */

/** @type {Blocker[]} */
export const LAUNCH_BLOCKERS = [
  {
    host: 'fonts.googleapis.com',
    introducedBy: 'src/layouts/Layout.astro',
    owner: 'PRD 3 — trilingual experience & design system',
    effect:
      'Every page load sends the visitor’s IP address and user-agent to Google in the United States, before the page has rendered and without any notice.',
    fix: 'Self-host Oswald, EB Garamond and Lato as woff2 files in public/fonts/ and drop the stylesheet link and both preconnect hints.',
  },
  {
    host: 'fonts.gstatic.com',
    introducedBy: 'src/layouts/Layout.astro',
    owner: 'PRD 3 — trilingual experience & design system',
    effect: 'Same as above: the font files themselves are fetched from Google on every page.',
    fix: 'Removed by the same change.',
  },
  {
    host: 'www.openstreetmap.org',
    introducedBy: 'src/pages/evenements/[slug].astro',
    owner: 'PRD 2 — structure & content alignment',
    effect:
      'The venue map is an iframe that loads as the event page opens, sending the visitor’s IP address to the OpenStreetMap Foundation before they have shown any interest in the map.',
    fix: 'Replace the embed with a static image plus a link, or load the iframe only after the visitor clicks. The written address is already beside it, so nothing is lost.',
  },
  {
    host: 'api.web3forms.com',
    introducedBy: 'src/pages/contact.astro',
    owner: 'PRD 1 — foundations (forms) / PRD 2',
    effect:
      'The contact form posts the sender’s name, email address and message body to a third-party form service. ADR-0001 rules out a form SaaS precisely so that message content stays in Switzerland. The access key is also still the literal placeholder, so the form does not work.',
    fix: 'Post to the Infomaniak mail handler described in ADR-0001, fronted by Cloudflare Turnstile.',
  },
  {
    host: 'unpkg.com',
    introducedBy: 'public/admin/index.html',
    owner: 'PRD 4 — editorial back-office',
    effect:
      'The CMS shell loads its entire application from a public CDN at an open version range, on every visit to /admin/. No visitor data is involved — this is an editors-only page — but the site’s back-office depends on a third party staying up and serving code nobody reviewed.',
    fix: 'Resolved by the CMS decision in ADR-0001; whichever CMS wins, pin the version and serve it from the site’s own origin.',
  },
];

export const blockedHosts = () => [...new Set(LAUNCH_BLOCKERS.map((blocker) => blocker.host))].sort();

export const describeBlockers = () =>
  LAUNCH_BLOCKERS.map(
    (blocker) =>
      `  ${blocker.host}\n` +
      `    introduced by : ${blocker.introducedBy}\n` +
      `    owned by      : ${blocker.owner}\n` +
      `    effect        : ${blocker.effect}\n` +
      `    fix           : ${blocker.fix}`,
  ).join('\n\n');
