# Public Read via Bucket Policy

Internal analytics data exposed to the internet via `Principal: "*"` bucket policy with Public Access Block disabled.

## Background

This is the most commonly reported S3 vulnerability class — 7 of 25 HackerOne reports in the Stave test suite involve public read access. Companies as large as Shopify, Uber, and Mapbox have had this exact issue disclosed through bug bounty programs.

**Based on:** HackerOne reports #94502 (Shopify), #361438 (Uber), #202725 (Mapbox), #819278 (Greenhouse), #1474017 (Omise)

## Bucket

`corp-analytics-exports` — internal analytics data exposed via bucket policy granting `Principal: "*"` read access, with ACL also granting public read.

## Triggered Controls

| Control | Description |
|---------|-------------|
| `CTL.S3.PUBLIC.001` | No Public S3 Buckets — public_read is true |
| `CTL.S3.PUBLIC.004` | No Public Read via ACL — zero-tolerance duration |
| `CTL.S3.CONTROLS.001` | Public Access Block Must Be Enabled |

## Expected Findings

3 violations on 1 resource.
