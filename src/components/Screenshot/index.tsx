import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

type Props = {
  /** Filename under static/img/screenshots/, e.g. "catalog.png". */
  src: string;
  /** Caption, also used as alt text. */
  caption: string;
};

/**
 * Product screenshot with a graceful fallback. Screenshots of the native app
 * cannot be captured from the docs toolchain, so pages reference them by name
 * and render a labelled frame until the file exists. The list of required
 * files lives in static/img/screenshots/NEEDED.md.
 */
export function Screenshot({src, caption}: Props) {
  const url = useBaseUrl(`/img/screenshots/${src}`);
  const [missing, setMissing] = React.useState(false);
  const isDev = process.env.NODE_ENV === 'development';
  // A public site should not advertise what it lacks; a dev server should.
  if (missing && !isDev) return null;
  return (
    <figure className={styles.figure}>
      {missing ? (
        <div className={styles.placeholder} role="img" aria-label={caption}>
          <span className={styles.badge}>screenshot pending</span>
          <span className={styles.name}>{src}</span>
        </div>
      ) : (
        <img src={url} alt={caption} loading="lazy" onError={() => setMissing(true)} />
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
