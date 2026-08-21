/**
 * Preparing an announcement, having it read, and publishing it.
 *
 * The three states an editor works in are described in docs/editorial/publication.md.
 * Only two of them are stored — an entry is a draft or it is not — and the third,
 * relecture, is that same draft seen on the préproduction site. That is the whole
 * mechanism, and these are the assertions that keep it true:
 *
 *   1. a draft is not on the published site, anywhere;
 *   2. the same build, told it is staging, shows it;
 *   3. the deploy tells staging and only staging.
 *
 * The first two ask a real build, twice, and the pair is the interesting part:
 * a page that grew its own opinion about drafts would fail one or the other,
 * whichever way it leaned. The third reads the workflow files, which is the only
 * place that answer exists — and it is worth asking, because the distance
 * between "the flag works" and "the flag is set where it matters" is exactly
 * where this project has lost a pipeline before (#33).
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { buildWithContent, readPage, repoRoot, visibleText } from './helpers.mjs';

const PUBLISHED = /Soirée annoncée/;
const IN_PREPARATION = /Annonce en préparation/;
const DRAFT_ROUTE = '/evenements/2099-annonce-en-preparation';

/** One build per environment, several questions asked of each. */
const builds = {};
function build(name, env) {
  if (!builds[name]) {
    builds[name] = buildWithContent('drafts', env);
    assert.equal(builds[name].status, 0, `the ${name} build failed:\n${builds[name].output}`);
  }
  return builds[name];
}

const published = () => build('published', {});
const staging = () => build('staging', { UGAB_SHOW_DRAFTS: '1' });

test('an announcement the Comité is still preparing is not on the published site', () => {
  const site = published();

  const listing = visibleText(readPage(site.outDir, '/evenements'));
  assert.match(listing, PUBLISHED, 'the published announcement is missing');
  assert.doesNotMatch(listing, IN_PREPARATION, 'a draft is being announced to visitors');

  const home = visibleText(readPage(site.outDir, '/'));
  assert.doesNotMatch(home, IN_PREPARATION, 'a draft reached the home page');
});

test('and has no page of its own, so it cannot be reached by guessing the address', () => {
  const site = published();

  assert.throws(
    () => readPage(site.outDir, DRAFT_ROUTE),
    /No page was built/,
    'a draft was given a page a visitor could open directly',
  );
});

test('the same build shows it when it is told it is staging', () => {
  const site = staging();

  const listing = visibleText(readPage(site.outDir, '/evenements'));
  assert.match(
    listing,
    IN_PREPARATION,
    'the préproduction site does not list the draft, so nobody can review it there',
  );

  const page = visibleText(readPage(site.outDir, DRAFT_ROUTE));
  assert.match(page, IN_PREPARATION, 'the draft has no page of its own to be reviewed on');

  // Nothing about being a draft changes what the reviewer is looking at: the
  // point of reviewing it there is that it is the page, exactly as it will be.
  assert.match(
    visibleText(readPage(site.outDir, '/evenements')),
    PUBLISHED,
    'the published announcement disappeared from the staging build',
  );
});

// ---------------------------------------------------------------------------
// The half that only the pipeline knows
// ---------------------------------------------------------------------------

const workflow = (name) => readFileSync(path.join(repoRoot, '.github', 'workflows', name), 'utf8');

/** The text of one job in a workflow file, by name. */
function job(yaml, name) {
  const start = yaml.indexOf(`\n  ${name}:\n`);
  assert.notEqual(start, -1, `no job called ${name}`);
  const rest = yaml.slice(start + 1);
  const next = rest.slice(1).search(/\n {2}[a-z][a-z0-9-]*:\n/);
  return next === -1 ? rest : rest.slice(0, next + 1);
}

test('the publish workflow hands the flag to the build', () => {
  assert.match(
    workflow('publish.yml'),
    /UGAB_SHOW_DRAFTS:\s*\$\{\{\s*inputs\.show_drafts\s*\}\}/,
    'nothing passes the draft flag into the build, so no deploy can ever show a draft',
  );
});

test('staging is told to show drafts and production is told not to', () => {
  const deploy = workflow('deploy.yml');

  assert.match(
    job(deploy, 'staging'),
    /show_drafts:\s*true/,
    'the staging deploy does not ask for drafts, so there is nowhere to review one',
  );
  assert.match(
    job(deploy, 'production'),
    /show_drafts:\s*false/,
    'the production deploy does not say no to drafts — an unfinished announcement could go public',
  );
});
