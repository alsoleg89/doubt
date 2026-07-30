# Security policy

## Reporting

Please do not open a public issue for a vulnerability. Use GitHub's private vulnerability reporting
for this repository. If that is unavailable, contact the maintainer privately through the email
listed on their GitHub profile.

Include the affected version, reproduction steps, impact, and any suggested mitigation. You should
receive an acknowledgement within five business days.

## Security model

Doubt copies static skill files and analyzes local text. It does not execute skill content, call a
model, upload data, or collect telemetry. Installation writes only to the selected agent skill
directory. Use `doubt doctor` to detect local modifications to an installed copy.
