import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { repoRoot } from './lib/build-output.mjs';

/**
 * Keeps the French and English legal copy in step.
 *
 * It was written when only the French pages had routes and the English half
 * rendered nowhere — text that exists, is never seen, and quietly stops matching
 * the version people do see. Both halves are published now, which makes this
 * more useful rather than less: a section added in one language and forgotten in
 * the other is a policy that says less to one of its readers, and every other
 * assertion in this suite would pass.
 *
 * Loaded through Node's TypeScript support, which needs Node 22.18 or newer —
 * `engines` in package.json asks for at least that, for this reason. On anything
 * older these skip rather than fail, because a version-dependent red suite
 * teaches people to ignore red suites; the engine floor is what stops the skip
 * from being how the suite normally runs.
 */

let legal = null;
let loadError = null;
try {
  legal = await import(pathToFileURL(path.join(repoRoot, 'src/i18n/legal.ts')).href);
} catch (error) {
  loadError = error;
}

const skip = legal
  ? false
  : `legal.ts could not be loaded (${loadError?.code ?? loadError?.message})`;

const PAGES = ['privacy', 'legalNotice', 'accessibility'];

test('both languages carry the same legal pages', { skip }, () => {
  assert.deepEqual(Object.keys(legal.legalPages).sort(), ['en', 'fr']);
  for (const lang of ['fr', 'en']) {
    assert.deepEqual(
      Object.keys(legal.legalPages[lang]).sort(),
      [...PAGES].sort(),
      `${lang} is missing a page`,
    );
  }
});

test('a section added in one language is added in the other', { skip }, () => {
  for (const page of PAGES) {
    const fr = legal.legalPages.fr[page].sections;
    const en = legal.legalPages.en[page].sections;
    assert.equal(
      en.length,
      fr.length,
      `${page}: ${fr.length} sections in French, ${en.length} in English. One of them has drifted.`,
    );

    fr.forEach((section, index) => {
      assert.equal(
        Boolean(en[index].bullets),
        Boolean(section.bullets),
        `${page} section ${index + 1} (“${section.heading}”) is a list in one language and prose in the other`,
      );
      assert.equal(
        en[index].bullets?.length ?? en[index].paragraphs?.length,
        section.bullets?.length ?? section.paragraphs?.length,
        `${page} section ${index + 1} (“${section.heading}”) says a different number of things in each language`,
      );
    });
  }
});

test('every processor is described in both languages', { skip }, () => {
  for (const processor of legal.processors) {
    for (const field of ['name', 'country', 'purpose', 'receives', 'retention']) {
      for (const lang of ['fr', 'en']) {
        assert.ok(
          processor[field]?.[lang]?.trim(),
          `processor “${processor.id}” has no ${lang} ${field}, so one language’s policy says less than the other’s`,
        );
      }
    }
  }
});

test('every third party the site still contacts is explained in both languages', { skip }, () => {
  for (const exception of legal.preLaunchExceptions) {
    for (const lang of ['fr', 'en']) {
      assert.ok(
        exception.what?.[lang]?.trim(),
        `pre-launch exception “${exception.host}” has no ${lang} explanation`,
      );
    }
  }
});

test('a processor with no hostname is one the browser never talks to directly', { skip }, () => {
  const serverSideOnly = legal.processors.filter((processor) => processor.hosts.length === 0);
  assert.ok(
    serverSideOnly.length > 0,
    'every processor now has a hostname — if that is right, this test has outlived its point',
  );
  for (const processor of serverSideOnly) {
    assert.match(
      `${processor.purpose.fr} ${processor.receives.fr}`,
      /\S/,
      `${processor.id} contacts nothing from the browser, so the policy has to explain in words what it receives`,
    );
  }
});
