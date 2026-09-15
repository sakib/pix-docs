/**
 * Replaces `{{token}}` with values from the brand map, everywhere in Markdown.
 *
 * Two node shapes have to be handled, because MDX gets to the source first:
 *
 *   - In prose, MDX parses `{{product}}` as a JSX expression before any remark
 *     plugin runs, producing an `mdxTextExpression` node whose value is the
 *     inner `{product}`. Those are rewritten in place into plain text nodes.
 *   - Inside code blocks and inline code, MDX does not interpolate, so the
 *     literal `{{product}}` survives into the node value and is substituted
 *     with a plain regex.
 *
 * Written as a manual tree walk rather than using unist-util-visit so the
 * plugin carries no dependency of its own — it has to keep working across
 * Docusaurus upgrades that reshuffle transitive deps.
 *
 * Frontmatter is extracted before remark runs, so it is handled separately by
 * the parseFrontMatter hook in docusaurus.config.ts.
 */
const LITERAL_TOKEN = /\{\{(\w+)\}\}/g;
const MDX_EXPRESSION = /^\{\s*(\w+)\s*\}$/;
const MDX_EXPRESSION_TYPES = new Set([
  'mdxTextExpression',
  'mdxFlowExpression',
]);

module.exports = function remarkBrand(options = {}) {
  const vars = options.vars || {};

  const substitute = (value) =>
    value.replace(LITERAL_TOKEN, (match, key) =>
      key in vars ? vars[key] : match,
    );

  const walk = (node) => {
    if (!node || typeof node !== 'object') return;

    if (MDX_EXPRESSION_TYPES.has(node.type)) {
      const match = MDX_EXPRESSION.exec(String(node.value ?? '').trim());
      if (match && match[1] in vars) {
        // Rewrite the expression node into the literal text it stands for.
        // The estree payload has to go with it, or MDX will still compile the
        // original expression.
        node.type = 'text';
        node.value = vars[match[1]];
        delete node.data;
        return;
      }
    }

    if (typeof node.value === 'string') node.value = substitute(node.value);
    if (typeof node.url === 'string') node.url = substitute(node.url);
    if (typeof node.title === 'string') node.title = substitute(node.title);
    if (typeof node.alt === 'string') node.alt = substitute(node.alt);

    if (Array.isArray(node.children)) node.children.forEach(walk);
  };

  return (tree) => walk(tree);
};
