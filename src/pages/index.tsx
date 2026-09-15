import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Card, CardGrid} from '@site/src/components/Card';
import {Diagram} from '@site/src/components/Diagram';
import brand from '@site/brand';
import styles from './index.module.css';

const agents = [
  {name: 'Claude Code', soon: false},
  {name: 'Codex', soon: false},
  {name: 'Cursor', soon: false},
  {name: 'Pi', soon: false},
  {name: 'OpenCode', soon: true},
  {name: 'Copilot', soon: true},
];

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Documentation" description={siteConfig.tagline}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Documentation</p>
          <h1 className={styles.title}>{brand.product}</h1>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          <p className={styles.lede}>
            Work with any coding agent, move sessions between them, and stay in
            control from your Mac, Linux desktop, iPhone, iPad, or browser.
            Everything stays in <code>{brand.homeDir}</code> on your own machine.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} to="/getting-started/install">
              Get started
            </Link>
            <Link className={styles.secondary} href={brand.siteUrl}>
              Download
            </Link>
          </div>
          <ul className={styles.agents} aria-label="Supported agents">
            {agents.map((a) => (
              <li key={a.name} className={a.soon ? styles.soon : undefined}>
                {a.name}
                {a.soon && <span className={styles.soonTag}>soon</span>}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main className={styles.main}>
        <section>
          <h2 className={styles.h2}>What {brand.product} does</h2>
          <CardGrid cols={4}>
            <Card title="One catalog" icon="sessions" href="/guides/sessions">
              Every session, on every agent, including the ones you ran before
              installing {brand.product}.
            </Card>
            <Card title="Handoffs" icon="handoff" href="/guides/handoffs">
              Continue any session with a different agent. Start cheap, finish
              careful.
            </Card>
            <Card title="Branching" icon="branch" href="/guides/branching">
              Fork from any completed turn. The original stays intact.
            </Card>
            <Card title="Parallel work" icon="parallel" href="/guides/parallel-work">
              Many sessions at once, each in its own worktree. Work survives a
              closed window.
            </Card>
            <Card title="Surfaces" icon="surfaces" href="/guides/surfaces">
              Terminal, repository, browser, and simulator beside the chat. See
              what the agent did.
            </Card>
            <Card title="Every device" icon="remote" href="/guides/remote-access">
              One daemon; Mac, Linux, iPhone, iPad, and browser clients over LAN
              or Tailscale.
            </Card>
            <Card title="Search" icon="search" href="/guides/search-and-catalog">
              Trigram full-text search over titles, prompts, paths, branches,
              and states.
            </Card>
            <Card title="Usage" icon="usage" href="/guides/usage-and-context">
              Token spend and context occupancy per session, as it happens.
            </Card>
          </CardGrid>
        </section>

        <section>
          <h2 className={styles.h2}>How it fits</h2>
          <p className={styles.sectionLede}>
            A local daemon owns the state and the work. Clients are views onto
            it. Agents are the CLIs you already have, driven with your existing
            credentials.
          </p>
          <Diagram name="architecture" />
          <p className={styles.sectionFoot}>
            <Link to="/under-the-hood/architecture">Read the architecture →</Link>
          </p>
        </section>

        <section>
          <h2 className={styles.h2}>Next steps</h2>
          <CardGrid cols={3}>
            <Card title="Run your first session" icon="play" href="/getting-started/first-session">
              Add a project, pick an agent, send a prompt, find it again.
            </Card>
            <Card title="Look under the hood" icon="gear" href="/under-the-hood/architecture">
              Session logs, blobs, projections, and the index, explained from
              the files on disk.
            </Card>
            <Card title="Evaluate for a team" icon="building" href="/enterprise/editions">
              What is free, what the enterprise edition adds, and what is
              planned.
            </Card>
          </CardGrid>
        </section>
      </main>
    </Layout>
  );
}
