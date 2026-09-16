/**
 * Single source of truth for product naming.
 *
 * The product is being renamed before launch. Every user-visible occurrence of
 * the name — in TSX, in config, and in Markdown prose via the `{{product}}`
 * token — resolves from this file. Changing these values and rebuilding is the
 * entire rename.
 */
export const brand = {
  /** Display name, capitalised as it appears in prose. */
  product: 'Pix',
  /** Lowercase form, used for CLI-ish and path contexts. */
  productLower: 'pix',
  /** The dotfile directory the daemon owns. Tracks productLower. */
  homeDir: '~/.pix',
  /** Marketing site. */
  siteUrl: 'https://pixcode.sh',
  /** Company/org line. */
  org: 'The Jalal Organization',
  /** GitHub org that holds this docs repo. */
  githubOrg: 'sakib',
  githubRepo: 'pix-docs',
  tagline: 'One place for every coding agent.',
} as const;

export default brand;
