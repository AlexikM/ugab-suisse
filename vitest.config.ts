import { defineConfig } from 'vitest/config';

// Assertions about the built site, run against dist/ rather than a live server
// so that they run on every pull request. Browser-level behaviour is tested
// with Playwright instead — see playwright.config.ts and tests/e2e/.
export default defineConfig({
  test: {
    include: [
      // tests/build       — the built output: URLs, metadata, sitemap
      // tests/content     — content collections and the copy they carry
      // tests/compliance  — legal, privacy and consent obligations
      'tests/{build,content,compliance}/**/*.test.ts',
    ],
    environment: 'node',
  },
});
