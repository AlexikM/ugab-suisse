import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Colour contrast, computed from the design tokens themselves.
 *
 * `src/styles/global.css` prints a ratio beside most of its colours and says
 * they are "asserted in tests/build/contrast.test.ts". They were not: that file
 * did not exist. A number in a comment is a claim like any other, and this one
 * is load-bearing — the accessibility statement tells visitors that text
 * contrast was checked against the brand colours.
 *
 * The maths is the WCAG 2.x relative-luminance definition, which is short
 * enough to write out and avoids a dependency the next maintainer would inherit
 * for four lines of arithmetic.
 */

const CSS = fileURLToPath(new URL('../../src/styles/global.css', import.meta.url));

export type Palette = Record<string, string>;

/** `--color-navy: #12294d` → `{ navy: '#12294d' }`. Six-digit hex only. */
export function paletteFrom(css: string): Palette {
  return Object.fromEntries(
    [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map(([, token, hex]) => [
      token,
      hex.toLowerCase(),
    ]),
  );
}

/**
 * Every measured ratio written into the stylesheet, as numbers.
 *
 * Two decimals exactly: that is how a measurement is written there — `4.91:1`,
 * `13.65:1`. The thresholds it also quotes, `4.5:1` for body text and `3:1` for
 * a control boundary, are what WCAG asks for rather than what these colours do,
 * and they are not claims about the palette.
 */
export function ratiosClaimedIn(css: string): number[] {
  return [...css.matchAll(/(\d+\.\d\d):1/g)].map(([, value]) => Number(value));
}

const channel = (value: number): number =>
  value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

export function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

export const readStylesheet = (): string => readFileSync(CSS, 'utf8');
