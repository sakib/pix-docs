import MDXComponents from '@theme-original/MDXComponents';
import {Card, CardGrid} from '@site/src/components/Card';
import {Screenshot} from '@site/src/components/Screenshot';
import {Diagram} from '@site/src/components/Diagram';

/**
 * Components available in every MDX page without an import. Keep this list
 * short: anything here is effectively part of the docs' authoring language.
 */
export default {
  ...MDXComponents,
  Card,
  CardGrid,
  Screenshot,
  Diagram,
};
