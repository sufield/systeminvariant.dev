import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "Stave",
  tagline: "AWS security findings from configuration snapshots — no credentials required",
  favicon: "img/favicon.ico",
  future: {
    v4: true,
  },
  markdown: {
    // Enables parsing ```mermaid fences; rendering comes from the
    // @docusaurus/theme-mermaid entry in `themes` below.
    mermaid: true,
    // .md = CommonMark (no JSX), .mdx = MDX. Generated docs (control catalog,
    // command reference) contain `{`/`<` that MDX cannot parse; CommonMark is
    // safe. Must live in this SAME markdown object — a second `markdown:` key
    // would clobber `mermaid: true`.
    format: "detect",
  },
  themes: [
    "@docusaurus/theme-mermaid",
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        indexBlog: true,
        indexDocs: true,
        docsRouteBasePath: "/docs",
        blogRouteBasePath: "/blog",
      },
    ],
  ],
  url: "https://www.systeminvariant.dev",
  baseUrl: "/",
  organizationName: "sufield",
  projectName: "stave",
  // Diátaxis reorg changes doc slugs; in-content cross-links are fixed in a
  // follow-up link pass. Build must still produce a working site.
  onBrokenLinks: "throw",
  onBrokenAnchors: "warn",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  presets: [
    [
      "classic",
      {
        docs: {
          // Canonical Diátaxis source tree (real files synced via scripts/sync-guide.sh).
          path: "stave-guide",
          routeBasePath: "docs",
          sidebarPath: "./sidebars.ts",
          editUrl: undefined,
          exclude: [
            "README.md",
            "tasks.md",
            "clig-audit.md",
            "compliance-baseline.md",
            "explanation/go-idioms.md",
            "explanation/pending-items.md",
            "recordings/**",
            // Journey pages moved to /why-stave site pages
            "discover.md",
            "evaluate.md",
            "learn.md",
            "build.md",
            "scale.md",
            // Content moved to getting-started/ and labs/
            "tutorials/**",
            // Merged into labs/
            "demos/**",
            "challenge/**",
            // Moved to explanation/
            "positioning/**",
          ],
        },
        blog: {
          path: "blog",
          showReadingTime: true,
          blogSidebarCount: "ALL",
          blogSidebarTitle: "All posts",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      },
    ],
  ],
  themeConfig: {
    metadata: [
      { name: "twitter:card", content: "summary" },
    ],
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Stave",
      items: [
        { to: "/docs", label: "Docs", position: "left" },
        { to: "/blog", label: "Blog", position: "left" },
        { to: "/why-stave/evaluate", label: "Why Stave", position: "left" },
        { href: "https://github.com/sufield/stave", label: "GitHub", position: "right" },
      ],
    },
    footer: {
      style: "dark",
    },
  },
  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          // 0.4 — slug fixes (already renamed, preserve old URLs)
          { from: "/docs/reference/hippa-cli", to: "/docs/reference/hipaa-cli" },
          { from: "/docs/reference/hippa-table", to: "/docs/reference/hipaa-table" },
          // Step 2.1 — Getting Started extractions from tutorials
          { from: "/docs/tutorials/first-evaluation", to: "/docs/getting-started/first-evaluation" },
          { from: "/docs/tutorials/installation", to: "/docs/getting-started/installation" },
          { from: "/docs/tutorials/first-finding", to: "/docs/getting-started/first-finding" },
          { from: "/docs/tutorials/reading-chain-findings", to: "/docs/getting-started/reading-chain-findings" },
          { from: "/docs/tutorials/fix-and-verify", to: "/docs/getting-started/fix-and-verify" },
          { from: "/docs/tutorials/ci-pipeline-gate", to: "/docs/getting-started/add-to-ci" },
          // Step 2.1 — evicted/merged tutorials
          { from: "/docs/tutorials/quick-start", to: "/docs/getting-started/first-evaluation" },
          { from: "/docs/tutorials/introduction", to: "/docs/getting-started/first-evaluation" },
          { from: "/docs/tutorials/START-HERE", to: "/docs/getting-started/first-evaluation" },
          // Step 2.2 — Labs merges (old tutorials → labs)
          { from: "/docs/tutorials/from-steampipe-to-stave", to: "/docs/labs/from-steampipe-to-stave" },
          { from: "/docs/tutorials/docker-demo", to: "/docs/labs/docker-scenarios" },
          { from: "/docs/tutorials/s3-public-exposure-long-lived-iam-keys", to: "/docs/labs/s3-public-exposure-long-lived-iam-keys" },
          { from: "/docs/tutorials/cognito-unauthenticated-s3-takeover", to: "/docs/labs/cognito-unauthenticated-s3-takeover" },
          { from: "/docs/tutorials/shadow-admin-compute-role-privilege-drift", to: "/docs/labs/shadow-admin-compute-role-privilege-drift" },
          { from: "/docs/tutorials/s3-ransomware-protection-forensic-auditability", to: "/docs/labs/s3-ransomware-protection-forensic-auditability" },
          { from: "/docs/tutorials/cross-account-kms-key-policy-isolation", to: "/docs/labs/cross-account-kms-key-policy-isolation" },
          { from: "/docs/tutorials/sadcloud-multi-service-validation", to: "/docs/labs/sadcloud-multi-service-validation" },
          { from: "/docs/tutorials/chain-discovery", to: "/docs/labs/chain-discovery" },
          { from: "/docs/tutorials/reasoning-engines", to: "/docs/labs/reasoning-engines" },
          { from: "/docs/tutorials/lab-metrics", to: "/docs/labs/lab-metrics" },
          { from: "/docs/tutorials/library-in-process", to: "/docs/labs/library-in-process" },
          { from: "/docs/tutorials/policy-forge", to: "/docs/labs/policy-forge" },
          { from: "/docs/tutorials/logic-trace", to: "/docs/labs/logic-trace" },
          { from: "/docs/tutorials/writing-controls", to: "/docs/labs/writing-controls" },
          { from: "/docs/tutorials/compliance-evidence", to: "/docs/labs/compliance-evidence" },
          // Step 2.2 — Demos → Labs
          { from: "/docs/demos", to: "/docs/labs/docker-scenarios" },
          // Step 2.2 — Challenge → Labs
          { from: "/docs/challenge", to: "/docs/labs/case-studies" },
          // Step 2.2 — Positioning → Explanation
          { from: "/docs/positioning", to: "/docs/explanation" },
          // Step 3 — Journey pages move out of /docs
          { from: "/docs/discover", to: "/why-stave/discover" },
          { from: "/docs/evaluate", to: "/why-stave/evaluate" },
          { from: "/docs/learn", to: "/why-stave/learn" },
          { from: "/docs/build", to: "/why-stave/build" },
          { from: "/docs/scale", to: "/why-stave/scale" },
          // Step 6 — reference dedup redirects
          { from: "/docs/reference/command-reference", to: "/docs/reference/cli-reference" },
          { from: "/docs/reference/limits", to: "/docs/reference/scope-and-support" },
          // Step 5 — how-to relocations
          { from: "/docs/labs/building-extractors", to: "/docs/how-to/integration/building-extractors" },
          // Step 7 — explanation merges (deleted unlisted ghost pages)
          { from: "/docs/explanation/offline-airgapped", to: "/docs/explanation/air-gapped-analysis" },
          { from: "/docs/explanation/system-invariant-as-code", to: "/docs/explanation/system-invariants" },
          { from: "/docs/explanation/risk-reasoning", to: "/docs/explanation/how-stave-works" },
        ],
      },
    ],
    "@signalwire/docusaurus-plugin-llms-txt",
  ],
  clientModules: [],
  staticDirectories: ["static", "recordings"],
};

export default config;
