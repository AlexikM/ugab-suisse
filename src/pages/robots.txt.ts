import type { APIRoute } from 'astro';

import { withBase } from '../i18n/utils';

/**
 * `robots.txt`, decided by the same flag as the `noindex` meta tag.
 *
 * `src/layouts/Layout.astro` has said for a while that "robots.txt disallows
 * everything". It did not exist. `docs/infrastructure-setup.md` lists that as
 * open, and `.github/workflows/publish.yml` works around it by writing one into
 * the transferred output for staging — which covers staging and leaves every
 * other way of publishing the site with no robots.txt at all.
 *
 * One flag decides both mechanisms now, which is what
 * `docs/deploy-pipeline.md` asks for: `PUBLIC_SITE_INDEXABLE` is true for a real
 * launch and unset everywhere else. The publish step still writes its own copy
 * for staging; the two agree, and belt and braces is the right number of
 * safeguards for content the committee has not agreed to publish.
 *
 * **A caveat worth stating rather than discovering.** A crawler reads
 * `robots.txt` at the origin root and nowhere else. While the site is served
 * from a subdirectory — GitHub Pages under `/ugab-suisse/` — this file lands at
 * `/ugab-suisse/robots.txt`, which no crawler will look for. On a preview it is
 * the `noindex` meta tag that does the work; this file starts being effective
 * the day the base prefix goes and the site sits at the root of its own domain.
 */
export const GET: APIRoute = ({ site }) => {
  const indexable = import.meta.env.PUBLIC_SITE_INDEXABLE === 'true';

  const body = indexable
    ? [
        'User-agent: *',
        'Allow: /',
        '',
        // Through withBase, not the bare filename: the sitemap lives under the
        // base prefix while there is one, and at the root once there is not.
        `Sitemap: ${new URL(withBase('/sitemap-index.xml'), site).href}`,
        '',
      ]
    : ['User-agent: *', 'Disallow: /', ''];

  return new Response(body.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
