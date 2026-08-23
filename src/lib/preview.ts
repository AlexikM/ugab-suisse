/**
 * Build-level switches that show something not ready to be used.
 *
 * Read from the environment rather than passed down through pages, because they
 * are properties of the build and not of any one page. `UGAB_SHOW_DRAFTS` is
 * read the same way, for the same reason — see `draftsVisibleByDefault()` in
 * ./content.ts.
 */

const enabled = (name: string): boolean => {
  const flag = typeof process === 'undefined' ? undefined : process.env[name];
  return flag === '1' || flag === 'true';
};

/**
 * Whether to draw the forms that cannot send yet.
 *
 * Off in every build that is not asked for it, so a visitor never meets one.
 * The prototype's contact form posted to a third party with a placeholder key
 * and delivered nothing, and the whole point of removing it was that a form
 * which discards what somebody wrote is worse than no form.
 *
 * On, the fields work and the send button does not — enough to judge the design
 * and agree the fields, and impossible to mistake for something that will
 * arrive, because the button says so and a line under it says so again.
 *
 *     UGAB_PREVIEW_FORMS=1 npm run dev
 */
export const formsPreviewed = (): boolean => enabled('UGAB_PREVIEW_FORMS');
