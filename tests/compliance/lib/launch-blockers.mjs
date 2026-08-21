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
    host: 'unpkg.com',
    introducedBy: 'public/admin/index.html',
    owner: 'PRD 4 — editorial back-office',
    effect:
      'The Committee’s editing tool is fetched whole from a public CDN at an open version range, so whoever controls that range controls the tool that can rewrite the site. No visitor page reaches it.',
    fix: 'Pin the version and self-host the asset alongside the site.',
  },
];

export const blockedHosts = () =>
  [...new Set(LAUNCH_BLOCKERS.map((blocker) => blocker.host))].sort();

export const describeBlockers = () =>
  LAUNCH_BLOCKERS.map(
    (blocker) =>
      `  ${blocker.host}\n` +
      `    introduced by : ${blocker.introducedBy}\n` +
      `    owned by      : ${blocker.owner}\n` +
      `    effect        : ${blocker.effect}\n` +
      `    fix           : ${blocker.fix}`,
  ).join('\n\n');
