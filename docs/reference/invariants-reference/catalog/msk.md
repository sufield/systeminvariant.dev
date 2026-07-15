# MSK controls (9)

### CTL.MSK.AUTH.MTLS.001[​](#ctlmskauthmtls001 "Direct link to CTL.MSK.AUTH.MTLS.001")

**MSK Clusters Must Enforce Mutual TLS Authentication**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: IA-5; soc2: CC6.1;

MSK clusters must enforce mutual TLS (mTLS) for client-broker connections. Without mTLS, adversaries can impersonate clients, intercept sessions, and connect unauthorized producers or consumers.

**Remediation:** Enable mTLS with a certificate authority ARN in the cluster authentication configuration.

***

### CTL.MSK.AUTH.UNRESTRICTED.001[​](#ctlmskauthunrestricted001 "Direct link to CTL.MSK.AUTH.UNRESTRICTED.001")

**MSK Clusters Must Not Allow Unauthenticated Access**

* **Severity:** critical
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-3; soc2: CC6.1;

MSK clusters must not enable unauthenticated client access. Without authentication, any network-reachable client can produce or consume messages — reading sensitive data, injecting malicious events, or disrupting the stream.

**Remediation:** Disable unauthenticated access and enable IAM, SASL, or mTLS authentication.

***

### CTL.MSK.CONNECTOR.ENCRYPT.001[​](#ctlmskconnectorencrypt001 "Direct link to CTL.MSK.CONNECTOR.ENCRYPT.001")

**MSK Connect Connectors Must Encrypt Traffic in Transit**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** nist\_800\_53\_r5: SC-8; soc2: CC6.7;

MSK Connect connectors must use TLS for in-transit encryption. Without TLS, data streams between connectors and Kafka brokers are transmitted in plaintext.

**Remediation:** Set connector EncryptionType to TLS.

***

### CTL.MSK.ENCRYPT.REST.001[​](#ctlmskencryptrest001 "Direct link to CTL.MSK.ENCRYPT.REST.001")

**MSK Clusters Must Use Customer-Managed KMS Key for Encryption at Rest**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** nist\_800\_53\_r5: SC-28; soc2: CC6.7;

MSK clusters must use a customer-managed KMS key for data volume encryption. Service-managed keys prevent granular key policies, independent rotation, and crypto-shredding capability.

**Remediation:** Specify a customer-managed KMS key via DataVolumeKMSKeyId.

***

### CTL.MSK.ENCRYPT.TRANSIT.001[​](#ctlmskencrypttransit001 "Direct link to CTL.MSK.ENCRYPT.TRANSIT.001")

**MSK Clusters Must Encrypt All Traffic in Transit**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** nist\_800\_53\_r5: SC-8; soc2: CC6.7;

MSK clusters must enforce TLS for both client-broker and inter-broker traffic. Without TLS, Kafka messages — including credentials, event data, and replication traffic — are transmitted in plaintext.

**Remediation:** Set client-broker encryption to TLS only and enable inter-broker encryption.

***

### CTL.MSK.LOG.001[​](#ctlmsklog001 "Direct link to CTL.MSK.LOG.001")

**MSK Clusters Must Have Broker Logging Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AU-2; soc2: CC7.1;

MSK clusters must have at least one logging destination configured (CloudWatch Logs, S3, or Firehose) for broker logs. Without logging, broker operations, authentication events, and access patterns are invisible.

**Remediation:** Enable broker logging to CloudWatch Logs, S3, or Firehose in the cluster logging configuration.

***

### CTL.MSK.MONITORING.001[​](#ctlmskmonitoring001 "Direct link to CTL.MSK.MONITORING.001")

**MSK Clusters Must Enable Enhanced Monitoring**

* **Severity:** low
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AU-6;

MSK clusters must use enhanced monitoring (PER\_BROKER or higher). Default monitoring provides insufficient metrics for detecting broker health issues, replication lag, and consumer problems.

**Remediation:** Set enhanced monitoring to PER\_BROKER or PER\_TOPIC\_PER\_BROKER.

***

### CTL.MSK.PUBLIC.001[​](#ctlmskpublic001 "Direct link to CTL.MSK.PUBLIC.001")

**MSK Clusters Must Not Be Publicly Accessible**

* **Severity:** critical
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

MSK cluster broker endpoints must not be exposed to the public internet. Public brokers allow unauthorized consumers to read topics, rogue producers to inject events, and internet-wide scanning to enumerate cluster metadata.

**Remediation:** Disable public access on the cluster configuration.

***

### CTL.MSK.VERSION.001[​](#ctlmskversion001 "Direct link to CTL.MSK.VERSION.001")

**MSK Clusters Must Run a Supported Kafka Version**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-2; soc2: CC7.1;

MSK clusters must run a supported Kafka version. Outdated versions lack security patches and may have known vulnerabilities.

**Remediation:** Upgrade the cluster to the latest supported Kafka version.

***
