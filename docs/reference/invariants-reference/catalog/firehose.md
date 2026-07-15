# FIREHOSE controls (1)

### CTL.FIREHOSE.GHOST.S3.001[​](#ctlfirehoseghosts3001 "Direct link to CTL.FIREHOSE.GHOST.S3.001")

**Firehose Delivery Stream S3 Destination Bucket Deleted**

* **Severity:** critical
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** fedramp\_moderate: AU-2, SC-8; hipaa: 164.312(b), 164.312(e)(1); iso\_27001\_2022: A.5.16, A.8.15, A.8.24; nist\_800\_53\_r5: AU-2, AU-9, SC-8, SI-4; pci\_dss\_v4.0: 10.1, 10.5; soc2: CC6.1, CC7.1, CC8.1;

Amazon Data Firehose delivery stream is configured to deliver records to an S3 bucket that has been deleted. Firehose buffers records and attempts delivery, but every delivery attempt fails. If the bucket name is re-registered under a different account, Firehose may resume delivery to attacker-controlled storage — the bucket hijacking vector documented by Unit 42. The delivery stream configuration appears valid; the destination ARN shows the bucket name; the bucket no longer exists or has been re-registered.

**Remediation:** Recreate the S3 bucket with the original name and restore the bucket policy granting firehose.amazonaws.com PutObject access, or update the delivery stream destination: aws firehose update-destination --delivery-stream-name --current-delivery-stream-version-id --extended-s3-destination-update BucketARN=arn:aws:s3:::,RoleARN=. Investigate whether the bucket was re-registered under a different account during the gap period.

***
