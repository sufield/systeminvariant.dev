import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type DiataxisCard = {
  title: string;
  icon: string;
  href: string;
  description: ReactNode;
};

const Cards: DiataxisCard[] = [
  {
    title: 'Tutorials',
    icon: '\u{1F393}', // graduation cap
    href: '/docs/tutorials',
    description: (
      <>Learn by doing — guided, guaranteed-success walkthroughs from install to your first finding.</>
    ),
  },
  {
    title: 'How-to Guides',
    icon: '\u{1F6E0}️', // hammer and wrench
    href: '/docs/how-to',
    description: (
      <>Task-oriented recipes: run in CI, write a control, enforce a guardrail, investigate a finding.</>
    ),
  },
  {
    title: 'Explanation',
    icon: '\u{1F4A1}', // light bulb
    href: '/docs/explanation',
    description: (
      <>The concepts and reasoning — compound risk, invariants, why Stave reasons where scanners scan.</>
    ),
  },
  {
    title: 'Reference',
    icon: '\u{1F4D6}', // open book
    href: '/docs/reference',
    description: (
      <>The facts: control catalog, CLI commands, schemas, contracts, and compliance mappings.</>
    ),
  },
];

function Card({title, icon, href, description}: DiataxisCard) {
  return (
    <div className={clsx('col col--3')}>
      <Link to={href} className={styles.card}>
        <div className="text--center">
          <span className={styles.featureIcon} role="img">{icon}</span>
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {Cards.map((props, idx) => (
            <Card key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
