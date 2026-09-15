import React from 'react';
import Architecture from '@site/static/img/diagrams/architecture.svg';
import SessionStorage from '@site/static/img/diagrams/session-storage.svg';
import ProjectionFingerprint from '@site/static/img/diagrams/projection-fingerprint.svg';
import HandoffVsBranch from '@site/static/img/diagrams/handoff-vs-branch.svg';
import styles from './styles.module.css';

const diagrams = {
  architecture: Architecture,
  'session-storage': SessionStorage,
  'projection-fingerprint': ProjectionFingerprint,
  'handoff-vs-branch': HandoffVsBranch,
};

type Props = {name: keyof typeof diagrams; caption?: string};

/**
 * Inline SVG diagram. Inlined (not <img>) so `currentColor` and the theme's
 * CSS variables resolve, which is what makes one file work in both colour
 * modes.
 */
export function Diagram({name, caption}: Props) {
  const Svg = diagrams[name];
  return (
    <figure className={styles.figure}>
      <Svg className={styles.svg} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
