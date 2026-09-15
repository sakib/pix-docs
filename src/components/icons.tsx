import React from 'react';

/**
 * Small inline icon set, 24px grid, stroke-based so they inherit currentColor
 * and work in both colour modes. Kept here rather than pulling an icon
 * library: nine icons do not justify a dependency.
 */
type IconProps = {size?: number; className?: string};

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  'aria-hidden': true,
});

export const Sessions = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="4" width="18" height="16" rx="1" />
    <path d="M3 9h18M8 4v16" />
  </svg>
);

export const Handoff = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 7h11l-3-3M20 17H9l3 3" />
  </svg>
);

export const Branch = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="6" cy="5" r="2" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="9" r="2" />
    <path d="M6 7v10M18 11c0 3-4 3-12 4" />
  </svg>
);

export const Parallel = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 6h16M4 12h16M4 18h10" />
    <path d="M19 15l2 3-2 3" />
  </svg>
);

export const Surfaces = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <path d="M17 14v6M14 17h6" />
  </svg>
);

export const Remote = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="7" y="3" width="10" height="18" rx="2" />
    <path d="M11 18h2M3 9a9 9 0 0 1 0 6M21 9a9 9 0 0 0 0 6" />
  </svg>
);

export const Search = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M20 20l-4.5-4.5" />
  </svg>
);

export const Usage = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  </svg>
);

export const Lock = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="5" y="11" width="14" height="10" rx="1" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const Book = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z" />
  </svg>
);

export const Gear = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
  </svg>
);

export const Building = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="4" y="3" width="16" height="18" />
    <path d="M9 21v-4h6v4M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
  </svg>
);

export const Play = ({size = 24, className}: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);

export const icons = {
  sessions: Sessions,
  handoff: Handoff,
  branch: Branch,
  parallel: Parallel,
  surfaces: Surfaces,
  remote: Remote,
  search: Search,
  usage: Usage,
  lock: Lock,
  book: Book,
  gear: Gear,
  building: Building,
  play: Play,
};

export type IconName = keyof typeof icons;
