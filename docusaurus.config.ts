import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import brand from './brand';

const remarkBrand = require('./plugins/remark-brand');

// Built explicitly as plain strings rather than by spreading the imported
// module. Docusaurus JSON-serialises remark plugin options to build its cache
// key, and the transpiled module object is self-referential.
const brandTokens = {
  vars: {
    product: brand.product,
    productLower: brand.productLower,
    homeDir: brand.homeDir,
    siteUrl: brand.siteUrl,
    org: brand.org,
    githubOrg: brand.githubOrg,
    githubRepo: brand.githubRepo,
    tagline: brand.tagline,
  },
};

const config: Config = {
  title: brand.product,
  tagline: brand.tagline,
  favicon: 'img/favicon.ico',

  future: {v4: true, faster: true},

  url: `https://${brand.githubOrg}.github.io`,
  // `just docs` sets BASE_URL=/ so the dev server answers at localhost:3000/.
  baseUrl: process.env.BASE_URL ?? `/${brand.githubRepo}/`,
  organizationName: brand.githubOrg,
  projectName: brand.githubRepo,
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {onBrokenMarkdownLinks: 'warn'},
    mermaid: true,
    // Frontmatter is parsed before remark runs, so the remark plugin never
    // sees it. Substitute brand tokens in title/description/sidebar_label here.
    parseFrontMatter: async (params) => {
      const result = await params.defaultParseFrontMatter(params);
      const sub = (v: unknown) =>
        typeof v === 'string'
          ? v.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in brandTokens.vars ? (brandTokens.vars as Record<string, string>)[k] : m))
          : v;
      for (const key of ['title', 'description', 'sidebar_label']) {
        if (key in result.frontMatter) result.frontMatter[key] = sub(result.frontMatter[key]);
      }
      return result;
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  i18n: {defaultLocale: 'en', locales: ['en']},

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          // Must run before the default plugins: the table-of-contents
          // extractor reads headings, so substitution has to happen first or
          // raw tokens leak into the TOC and heading anchors.
          beforeDefaultRemarkPlugins: [[remarkBrand, brandTokens]],
          editUrl: `https://github.com/${brand.githubOrg}/${brand.githubRepo}/tree/main/`,
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {defaultMode: 'dark', respectPrefersColorScheme: true},
    navbar: {
      title: brand.product,
      logo: {alt: `${brand.product} logo`, src: 'img/logo.svg'},
      items: [
        {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'},
        {type: 'docSidebar', sidebarId: 'internals', position: 'left', label: 'Internals'},
        {type: 'docSidebar', sidebarId: 'enterprise', position: 'left', label: 'Enterprise'},
        {href: `https://github.com/${brand.githubOrg}/${brand.githubRepo}`, label: 'GitHub', position: 'right'},
        {href: brand.siteUrl, label: 'Download', position: 'right', className: 'navbar__download'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Start here',
          items: [
            {label: 'Introduction', to: '/intro'},
            {label: 'Install', to: '/getting-started/install'},
            {label: 'Your first session', to: '/getting-started/first-session'},
          ],
        },
        {
          title: 'Go deeper',
          items: [
            {label: 'Architecture', to: '/under-the-hood/architecture'},
            {label: `${brand.homeDir} reference`, to: '/under-the-hood/pix-directory'},
            {label: 'Privacy', to: '/under-the-hood/privacy'},
          ],
        },
        {
          title: 'Enterprise',
          items: [
            {label: 'Editions', to: '/enterprise/editions'},
            {label: 'Roadmap', to: '/roadmap'},
            {label: 'Download', href: brand.siteUrl},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} ${brand.org}. ${brand.product} is built by Ritesh Gupta.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'sql', 'ini'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
