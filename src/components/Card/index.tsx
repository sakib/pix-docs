import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {icons, type IconName} from '../icons';
import styles from './styles.module.css';

type CardProps = {
  title: string;
  href?: string;
  icon?: IconName;
  children?: React.ReactNode;
};

/**
 * A linkable card with an optional icon. Usable from any MDX page without an
 * import because it is registered in src/theme/MDXComponents.tsx.
 */
export function Card({title, href, icon, children}: CardProps) {
  const Icon = icon ? icons[icon] : null;
  const body = (
    <>
      {Icon && (
        <span className={styles.icon}>
          <Icon size={22} />
        </span>
      )}
      <span className={styles.title}>{title}</span>
      {children && <span className={styles.body}>{children}</span>}
    </>
  );
  if (href) {
    return (
      <Link to={href} className={clsx(styles.card, styles.link)}>
        {body}
      </Link>
    );
  }
  return <div className={styles.card}>{body}</div>;
}

type CardGridProps = {cols?: 2 | 3 | 4; children: React.ReactNode};

export function CardGrid({cols = 2, children}: CardGridProps) {
  return <div className={clsx(styles.grid, styles[`cols${cols}`])}>{children}</div>;
}
