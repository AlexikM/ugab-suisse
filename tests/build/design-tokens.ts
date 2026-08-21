import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The design system is a closed vocabulary: every colour, size and rhythm is a
 * token declared in `src/styles/global.css`, and components name the token
 * rather than the value.
 *
 * That file says a raw `#1a2b3c` or a `bg-blue-600` in a component "is a defect
 * — tests/build/design-tokens.test.ts fails the build on one". It did not exist.
 * This is that file, at the path the stylesheet names.
 *
 * It reads source rather than build output, which is unusual for this
 * directory, and it has to. Tailwind's own palette is switched off
 * (`--color-*: initial`), so `bg-blue-600` produces no CSS at all: the class
 * survives into the markup and does nothing. There is nothing in the output to
 * find. A raw hex, by contrast, works perfectly and quietly leaves the system.
 */

const REPO = fileURLToPath(new URL('../..', import.meta.url));

/** Tailwind's default palette. Ours carry no digits: `bg-red`, `text-gold`. */
const TAILWIND_PALETTE =
  /\b(?:bg|text|border|from|to|via|ring|fill|stroke|decoration|outline|shadow|accent|caret|divide|placeholder)-(?:slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;

/** `#fff`, `#12294d`, `#12294dcc`. */
const RAW_HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b/g;

export interface TokenViolation {
  file: string;
  value: string;
  reason: 'raw-colour' | 'tailwind-palette';
}

/** Everything that renders: pages, components, layouts — not the stylesheets. */
export function componentFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z', 'src'], { cwd: REPO, encoding: 'utf8' })
    .split('\0')
    .filter((file) => /\.(astro|ts)$/.test(file) && !file.startsWith('src/styles/'));
}

export function findTokenViolations(
  files: readonly { path: string; contents: string }[],
): TokenViolation[] {
  const violations: TokenViolation[] = [];

  for (const file of files) {
    for (const [value] of file.contents.matchAll(RAW_HEX)) {
      violations.push({ file: file.path, value, reason: 'raw-colour' });
    }
    for (const [value] of file.contents.matchAll(TAILWIND_PALETTE)) {
      violations.push({ file: file.path, value, reason: 'tailwind-palette' });
    }
  }

  return violations;
}

export const readComponents = (): { path: string; contents: string }[] =>
  componentFiles().map((file) => ({
    path: file,
    contents: readFileSync(path.join(REPO, file), 'utf8'),
  }));
