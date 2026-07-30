# Security policy

## Reporting

Please do not open a public issue for a vulnerability. Use GitHub's private
vulnerability reporting for this repository. If that is unavailable, contact
the maintainer privately through the email listed on their GitHub profile.

Include the affected version, reproduction steps, impact, and suggested
mitigation. You should receive an acknowledgement within five business days.

## Security model

Doubt copies static skill files, reads the map JSON explicitly passed to it, and
writes the requested HTML artifact. It does not call a model, fetch sources,
upload data, execute map content, run a background service, or collect
telemetry.

Map strings are HTML-escaped before rendering and embedded JSON escapes markup
delimiters. Source URLs remain user-supplied clickable links in the output; a
valid schema does not establish that a destination is safe or truthful. Review
untrusted maps before opening their external links.

Installation writes only to the selected agent skill directory. Use
`doubt doctor` to detect missing or locally modified installed copies.
