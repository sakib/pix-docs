#!/usr/bin/env node
/**
 * Renames the product across the docs site by editing brand.ts only.
 *
 * Usage:  node scripts/rename.mjs <NewName> [--dir ~/.newname] [--url https://newname.sh]
 *
 * Prose resolves the name through the `{{product}}` token (see
 * plugins/remark-brand.js); navbar, footer and titles import brand.ts directly.
 * Run `just build` afterwards to confirm nothing leaked.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandPath = join(root, 'brand.ts');

const args = process.argv.slice(2);
const product = args.find((a) => !a.startsWith('--'));
if (!product) {
  console.error('usage: node scripts/rename.mjs <NewName> [--dir ~/.newname] [--url https://newname.sh]');
  process.exit(1);
}
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? null : args[i + 1];
};

const productLower = product.toLowerCase();
const homeDir = flag('dir') ?? `~/.${productLower}`;
const siteUrl = flag('url');

let source = readFileSync(brandPath, 'utf8');
const setField = (field, value) => {
  const pattern = new RegExp(`(\\b${field}:\\s*)'[^']*'`);
  if (!pattern.test(source)) throw new Error(`field '${field}' not found in brand.ts`);
  source = source.replace(pattern, `$1'${value}'`);
};
setField('product', product);
setField('productLower', productLower);
setField('homeDir', homeDir);
if (siteUrl) setField('siteUrl', siteUrl);
writeFileSync(brandPath, source);

console.log(`product=${product} productLower=${productLower} homeDir=${homeDir}${siteUrl ? ` siteUrl=${siteUrl}` : ''}`);
console.log('brand.ts updated. Run `just build` to verify.');
