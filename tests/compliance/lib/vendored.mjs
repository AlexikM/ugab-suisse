/**
 * The Committee's editing tool, vendored whole rather than pulled from a CDN.
 *
 * It is a third-party application, not our source, and the two audits treat it
 * as one thing rather than as thousands of lines to read literally:
 *
 * - The request audit would report documentation links printed inside error
 *   messages as network calls. `svelte.dev/e/effect_orphan` is a page a
 *   developer reads, not a request anyone makes. Dozens of those bury the ones
 *   that matter.
 * - The storage audit would report the editor's own session and preference
 *   storage as if it were tracking a visitor.
 *
 * Neither is a finding. What makes the exemption safe rather than convenient:
 * `/admin` is not a visitor page, it sits behind the CMS's own authentication,
 * and no visitor route loads any of it. What the application actually reaches at
 * runtime is declared once, as an application, in the processor register — see
 * `preLaunchExceptions` in src/i18n/legal.ts.
 *
 * Shared by both audits so they cannot drift into disagreeing about what is
 * exempt. Exempt by exact name: a second vendored bundle does not inherit it.
 */
export const VENDORED_APPLICATION = /^\/admin\/sveltia-cms-[\d.]+\.js$/;

/** True when this built route is a vendored third-party application. */
export function isVendoredApplication(route) {
  return VENDORED_APPLICATION.test(route);
}
