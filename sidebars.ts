import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Three sidebars, one per navbar tab. A tab must never link into another
 * tab's sidebar — that is what made the earlier navigation feel broken.
 */
const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting started',
      className: 'sidebar-getting-started',
      collapsed: false,
      items: [
        'getting-started/install',
        'getting-started/first-session',
        'getting-started/connecting-agents',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      className: 'sidebar-guides',
      collapsed: false,
      items: [
        'guides/sessions',
        'guides/handoffs',
        'guides/branching',
        'guides/references',
        'guides/search-and-catalog',
        'guides/projects-and-scratch',
        'guides/worktrees',
        'guides/parallel-work',
        'guides/models',
        'guides/commands-and-skills',
        'guides/surfaces',
        'guides/remote-access',
        'guides/usage-and-context',
      ],
    },
    'troubleshooting',
  ],

  internals: [
    {
      type: 'category',
      label: 'Under the hood',
      className: 'sidebar-internals',
      collapsed: false,
      items: [
        'under-the-hood/architecture',
        'under-the-hood/pix-directory',
        'under-the-hood/session-log-format',
        'under-the-hood/snapshots-and-projections',
        'under-the-hood/blobs',
        'under-the-hood/index-db',
        'under-the-hood/native-history-import',
        'under-the-hood/updates',
        'under-the-hood/privacy',
      ],
    },
  ],

  enterprise: [
    {
      type: 'category',
      label: 'Enterprise',
      className: 'sidebar-enterprise',
      collapsed: false,
      items: [
        'enterprise/editions',
        'enterprise/shared-server',
        'enterprise/identity-and-access',
        'enterprise/audit-and-usage',
        'enterprise/policy',
      ],
    },
    'roadmap',
  ],
};

export default sidebars;
