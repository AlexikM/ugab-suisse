import { defineConfig, devices } from '@playwright/test';
import { configuredBase } from './tests/build/base-path.js';

// Browser-level tests: behaviour a visitor experiences — switching language,
// keyboard traversal, the donate button staying reachable. Assertions about
// the built files themselves belong in Vitest instead (see vitest.config.ts).
//
// The site is served by `astro preview`, so a build must have happened first.
// `npm run check` runs the build before these tests for that reason.

const PORT = 4321;

// The path prefix is handled once, here. Tests navigate relative to it —
// page.goto('./') for the home page, page.goto('./en/') for English — so that
// no test has to know whether the site is served from a subdirectory.
const baseURL = `http://localhost:${PORT}${configuredBase()}/`;

export default defineConfig({
  testDir: 'tests/e2e',
  // A stray .only would silently skip the rest of the suite in CI.
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  // One browser. Adding more triples the time every pull request waits, and
  // this site has no browser-specific behaviour to justify it yet.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
