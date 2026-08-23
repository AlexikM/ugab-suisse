/**
 * The Comité's editing interface is configured by one file — `public/admin/config.yml`
 * — which nothing read until this test existed.
 *
 * It is here because it happened. A `hint` was written with a French colon:
 *
 *     hint: Le nom du lieu, court : « Salle communale de Plainpalais »
 *
 * A colon followed by a space opens a mapping in YAML, so the parser saw a
 * nested mapping inside a plain scalar and refused the *whole document*. Sveltia
 * showed "There is an error in the CMS configuration" and nothing else: not a
 * degraded back-office, an absent one. Every other check in this repository
 * passed — the file is not source, nothing imports it, `astro build` never opens
 * it — and the site itself was perfect. The only way to find out was to open the
 * page, which no test did.
 *
 * The parse assertion is the whole reason this file exists. The rest are the
 * couplings the configuration states about itself in its own header, and which
 * were equally unchecked.
 *
 * What this cannot establish: that the interface *works*. Sveltia validates far
 * more than this does, and a configuration can parse, agree with the schema, and
 * still be refused for a reason only the application knows. Opening the page
 * remains the only proof of that, and it is in
 * `../../docs/editorial/back-office-maintenance.md` as a manual step.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const configPath = path.join(repoRoot, 'public', 'admin', 'config.yml');
const schemaPath = path.join(repoRoot, 'src', 'content.config.ts');

const schemaSource = readFileSync(schemaPath, 'utf8');

/**
 * The markdown body is not a frontmatter field. Astro renders it through
 * `render()`, so it never appears in the schema and must not be looked for
 * there.
 */
const NOT_FRONTMATTER = new Set(['body']);

function readConfig() {
  return parse(readFileSync(configPath, 'utf8'));
}

/** Every field an editor can fill in, across both collections. */
function declaredFields(config) {
  return config.collections.flatMap((collection) =>
    collection.fields.map((field) => ({ collection: collection.name, name: field.name })),
  );
}

test('the back-office configuration parses', () => {
  // Not a formality. This is the assertion that would have caught the outage,
  // and it is worth reading as: the editing interface starts at all.
  assert.doesNotThrow(
    () => readConfig(),
    'public/admin/config.yml is not valid YAML — the whole back-office is down',
  );
});

test('the configuration declares the two collections the site reads', () => {
  const config = readConfig();
  const folders = Object.fromEntries(config.collections.map((c) => [c.name, c.folder]));

  assert.deepEqual(Object.keys(folders).sort(), ['bureau', 'events']);
  // `src/content.config.ts` loads from these directories. A collection pointed
  // somewhere else writes files the build never reads, and an editor watches a
  // saved fiche never appear.
  assert.equal(folders.events, 'src/content/events');
  assert.equal(folders.bureau, 'src/content/bureau');
});

/**
 * Rule 1 of the configuration's own header: every field must exist in
 * `src/content.config.ts`, with the same name. A field invented here is written
 * into the entry and silently dropped by the build — the editor fills it in,
 * saves, and it is simply gone.
 *
 * The schema is read as text, not imported: `src/content.config.ts` imports
 * `astro:content`, a virtual module that only exists while Astro is running.
 * So this asks whether the schema declares a property of that name, and no
 * more. It cannot see optionality, which is the other half of the same rule and
 * is left to review — a field required by the build and optional here fails the
 * build after the editor has gone home, and this test would not say so.
 */
test('every field an editor can fill in exists in the content schema', () => {
  for (const { collection, name } of declaredFields(readConfig())) {
    if (NOT_FRONTMATTER.has(name)) continue;

    assert.match(
      schemaSource,
      new RegExp(`^\\s*${name}:`, 'm'),
      `the ${collection} collection offers a « ${name} » field that src/content.config.ts ` +
        'does not declare — whatever an editor types into it is dropped by the build',
    );
  }
});

/**
 * Where an uploaded photograph is written, and where the fiche then looks for
 * it, are two settings that have to agree. `media_folder` is a path on disk;
 * `public_folder` is the path an entry carries and the site serves. If they
 * disagree, every upload succeeds, every fiche saves, and every photograph on
 * the site is a broken image — a failure that shows up only in a browser, on
 * the live site, after a gala has been announced.
 */
test('an uploaded photograph is written where the site looks for it', () => {
  const { media_folder: mediaFolder, public_folder: publicFolder } = readConfig();

  assert.equal(
    mediaFolder,
    path.posix.join('public', publicFolder),
    `photographs are written to ${mediaFolder} but fiches reference ${publicFolder}`,
  );
});

/**
 * The site's languages are declared in `src/content.config.ts`; the fiche
 * language select repeats two of them. Offering one the schema does not accept
 * fails the build on the entry an editor has just saved — the failure the
 * configuration's LANGUES DU SITE comment exists to prevent, unchecked until now.
 *
 * The reverse is deliberately not asserted: Armenian is in the schema and not in
 * the select, because the Comité has not delivered it (#9).
 */
test('the fiche language select offers no language the schema refuses', () => {
  const config = readConfig();
  const events = config.collections.find((collection) => collection.name === 'events');
  const languages = events.fields.find((field) => field.name === 'lang').options;

  const accepted = schemaSource.match(/lang:\s*z\s*\.enum\(\[([^\]]*)\]/)?.[1];
  assert.ok(accepted, 'src/content.config.ts no longer declares the languages as an enum');

  for (const { value } of languages) {
    assert.match(
      accepted,
      new RegExp(`'${value}'`),
      `the fiche language select offers « ${value} », which the build refuses`,
    );
  }
});
