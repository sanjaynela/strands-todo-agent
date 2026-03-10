# Security Policy

## Credentials and Secrets
This repository must never contain AWS credentials, GitHub tokens, private keys, or any other secrets.

Use local credential providers instead of committing secrets:
- `aws configure` for local AWS CLI profiles
- Environment variables like `AWS_PROFILE` and `AWS_REGION` for profile selection
- External secret managers for production deployments

## Safe Usage for This Sample
- This sample uses in-memory state and local runtime credentials.
- Keep `.env` files local only; do not commit them.
- Run `npm run scan-secrets` before pushing changes.

## Reporting
If you discover a potential secret leak or vulnerability, open a private security report through GitHub Security Advisories for this repository.
