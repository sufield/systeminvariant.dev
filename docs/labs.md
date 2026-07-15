# Labs

Each lab creates a deliberately vulnerable environment, runs `stave apply`, and verifies the findings. Pick a domain and work through the scenario.

| Domain                     | What it covers                                                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S3**                     | Public-read buckets, long-lived IAM keys, ransomware protection gaps, forensic auditability.                                                                   |
| **IAM**                    | Shadow admin paths through compute roles, privilege drift, cross-account KMS key policy isolation.                                                             |
| **Cognito**                | Unauthenticated identity pool to S3 takeover — the classic misconfigured Cognito path.                                                                         |
| **Multi-Service**          | Cross-service misconfigurations detected by compound chain analysis (sadcloud, chain discovery).                                                               |
| **Lambda MicroVM**         | Eight labs for the Lambda MicroVM control family: overprivileged roles, missing TagSession, public artifact buckets, secrets in snapshots, and compound paths. |
| **Advanced**               | Reasoning engines, control authoring, policy forge, logic traces, compliance evidence, and lab metrics.                                                        |
| **Skill Track**            | Guided six-step progression: build → first findings → lab validation → write a control → reasoning engines → snapshot your account.                            |
| **Data Import**            | Bring data from Steampipe or Docker into Stave's observation format.                                                                                           |
| **Docker Scenarios**       | Curated S3 misconfiguration scenarios running entirely in Docker — nothing touches your cloud account.                                                         |
| **HackerOne Case Studies** | 30 real HackerOne reports replayed through Stave: public exposure, dangling references, presigned URL scope, and compound cross-service chains.                |
