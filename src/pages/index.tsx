import type {ReactNode} from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.tagline}
        </Heading>
        <p className="hero__subtitle">
          First finding on your own account in under fifteen minutes.
          Under five if you already run AWS Config or Steampipe.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/getting-started">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

const findingsExample = `FINDINGS:

  HIGH  CTL.S3.BUCKET.VERSIONING.001
        Bucket "prod-data" does not have versioning enabled
        evidence: versioning.status = "Disabled"

  CRITICAL  CTL.CLOUDTRAIL.GHOST.DEST.001          ★ STAVE ONLY
        CloudTrail trail "prod-trail" references destination bucket
        "prod-logs-2024" which does not appear in this account snapshot
        evidence: trail.s3_bucket_name has no matching asset`;

const dockerCode = `docker run --rm stave-demo`;

const installCode = `# Install (any OS)
go install github.com/sufield/stave/cmd/stave@latest

# Run against your snapshot
stave apply --observations ./my-snapshot/`;

function FindingsSection() {
  return (
    <section className={styles.findings}>
      <div className="container">
        <Heading as="h2">What you get</Heading>
        <p>
          ★ findings are configuration-graph findings — relationships between
          resources that single-setting scanners cannot see.
        </p>
        <CodeBlock language="text">{findingsExample}</CodeBlock>
      </div>
    </section>
  );
}

function TrySection() {
  return (
    <section className={styles.findings}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--6')}>
            <Heading as="h2">Try in a sandbox</Heading>
            <CodeBlock language="bash">{dockerCode}</CodeBlock>
            <p className={styles.hint}>
              Nothing installed on your machine. Stop the container and it's gone.
            </p>
          </div>
          <div className={clsx('col col--6')}>
            <Heading as="h2">Install locally</Heading>
            <CodeBlock language="bash">{installCode}</CodeBlock>
            <p className={styles.hint}>
              macOS: <code>brew install sufield/tap/stave</code>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="AWS security findings from configuration snapshots"
      description="First finding on your own account in under fifteen minutes. No credentials required.">
      <HomepageHeader />
      <main>
        <FindingsSection />
        <TrySection />
      </main>
    </Layout>
  );
}
