import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectAssetReferences, collectReferences, hostsOf, KIND } from './lib/scan.mjs';

const SITE = 'example.org';

/**
 * The scanner answers one question: if a browser rendered this page, which hosts
 * would it contact, and would it do so on its own or only because a visitor
 * chose to? Every case below is one where getting that answer wrong would make
 * the privacy policy understate what happens.
 */

test('a stylesheet link is an automatic request', () => {
  const refs = collectReferences({
    page: '/',
    html: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald" />',
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), ['fonts.googleapis.com']);
});

test('preconnect and dns-prefetch open connections and count as automatic', () => {
  const refs = collectReferences({
    page: '/',
    html: `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
           <link rel="dns-prefetch" href="https://cdn.example.net" />`,
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), ['cdn.example.net', 'fonts.gstatic.com']);
});

test('an iframe is an automatic request', () => {
  const refs = collectReferences({
    page: '/evenements/gala/',
    html: '<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=1,2,3,4"></iframe>',
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), ['www.openstreetmap.org']);
});

test('scripts, images, srcset and media all count', () => {
  const refs = collectReferences({
    page: '/',
    html: `<script src="https://unpkg.com/thing.js"></script>
           <img src="https://img.example.net/a.jpg" srcset="https://cdn2.example.net/a.jpg 2x">
           <video poster="https://media.example.net/p.jpg"><source src="https://media2.example.net/v.mp4"></video>`,
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), [
    'cdn2.example.net',
    'img.example.net',
    'media.example.net',
    'media2.example.net',
    'unpkg.com',
  ]);
});

test('CSS url() and @import inside a style block count', () => {
  const refs = collectReferences({
    page: '/',
    html: `<style>@import url("https://fonts.googleapis.com/css2?family=X");
           .hero { background: url('https://images.example.net/hero.jpg'); }</style>`,
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), ['fonts.googleapis.com', 'images.example.net']);
});

test('a form target receives personal data and is reported separately from automatic loads', () => {
  const refs = collectReferences({
    page: '/contact/',
    html: '<form action="https://api.web3forms.com/submit" method="POST"></form>',
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), []);
  assert.deepEqual(hostsOf(refs, KIND.FORM_TARGET), ['api.web3forms.com']);
});

test('a link the visitor may click is not a request the site makes', () => {
  const refs = collectReferences({
    page: '/',
    html: '<a href="https://www.instagram.com/ugabsuisse/" rel="noopener noreferrer">Instagram</a>',
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), []);
  assert.deepEqual(hostsOf(refs, KIND.OUTBOUND_LINK), ['www.instagram.com']);
});

test('the site’s own host and relative URLs are first party', () => {
  const refs = collectReferences({
    page: '/',
    html: `<img src="/ugab-suisse/images/logo.svg">
           <link rel="canonical" href="https://example.org/ugab-suisse/">
           <script src="./_astro/page.js"></script>`,
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), []);
});

test('protocol-relative URLs are resolved rather than ignored', () => {
  const refs = collectReferences({
    page: '/',
    html: '<script src="//cdn.example.net/tracker.js"></script>',
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), ['cdn.example.net']);
});

test('a reference records the page and the URL so a failure can be acted on', () => {
  const refs = collectReferences({
    page: '/contact/',
    html: '<iframe src="https://maps.example.net/embed?q=geneva"></iframe>',
    siteHost: SITE,
  });
  assert.deepEqual(refs, [
    {
      host: 'maps.example.net',
      kind: KIND.AUTOMATIC,
      page: '/contact/',
      url: 'https://maps.example.net/embed?q=geneva',
      via: 'iframe[src]',
    },
  ]);
});

test('HTML-escaped ampersands in attributes do not corrupt the recorded URL', () => {
  const refs = collectReferences({
    page: '/',
    html: '<iframe src="https://maps.example.net/e?a=1&amp;b=2"></iframe>',
    siteHost: SITE,
  });
  assert.equal(refs[0].url, 'https://maps.example.net/e?a=1&b=2');
});

test('a URL built at runtime in a script is reported, because it is still a request', () => {
  const refs = collectReferences({
    page: '/',
    html: '<script>fetch("https://analytics.example.net/collect")</script>',
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.SCRIPT_LITERAL), ['analytics.example.net']);
});

test('a background image set with an inline style attribute is found', () => {
  const refs = collectReferences({
    page: '/',
    html: '<div style="background-image:url(https://bg.example.net/hero.jpg)"></div>',
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), ['bg.example.net']);
});

test('a lazy-load attribute is not a request the browser makes', () => {
  const refs = collectReferences({
    page: '/',
    html: '<img data-src="https://lazy.example.net/a.jpg" src="/local.jpg">',
    siteHost: SITE,
  });
  assert.deepEqual(
    hostsOf(refs, KIND.AUTOMATIC),
    [],
    'recording it would push a host into the published processor list that the site never contacts',
  );
});

test('a font imported by the built stylesheet is found, not just one linked from the HTML', () => {
  const refs = collectAssetReferences({
    route: '/_astro/index.CJq1.css',
    source:
      '@font-face{font-family:Oswald;src:url("https://fonts.gstatic.com/s/oswald.woff2") format("woff2")}',
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.AUTOMATIC), ['fonts.gstatic.com']);
});

test('a beacon in a bundled script is found', () => {
  const refs = collectAssetReferences({
    route: '/_astro/page.js',
    source: 'navigator.sendBeacon("https://analytics.example.net/hit",d)',
    siteHost: SITE,
  });
  assert.deepEqual(hostsOf(refs, KIND.SCRIPT_LITERAL), ['analytics.example.net']);
});

test('a bundled asset that references nothing external is quiet', () => {
  const refs = collectAssetReferences({
    route: '/_astro/index.css',
    source: '.hero{background:url(/ugab-suisse/images/hero.jpg)}',
    siteHost: SITE,
  });
  assert.deepEqual(refs, []);
});

test('mailto and tel targets are not hosts', () => {
  const refs = collectReferences({
    page: '/contact/',
    html: '<a href="mailto:contact@example.org">Écrire</a><a href="tel:+41221234567">Appeler</a>',
    siteHost: SITE,
  });
  assert.deepEqual(refs, []);
});
