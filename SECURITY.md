# Security policy

## Reporting

Please do not open a public issue for a vulnerability. Use GitHub's private
vulnerability reporting for this repository. If that is unavailable, contact
the maintainer privately through the email listed on their GitHub profile.

Include the affected version, reproduction steps, impact, and suggested
mitigation. You should receive an acknowledgement within five business days.

## Security model

Doubt copies static skill files, reads the map JSON explicitly passed to it, and
writes the requested HTML artifact. Normal validation, rendering, installation,
and browser-playground flows do not call a model, fetch sources, upload data,
execute map content, run a background service, or collect telemetry.

`doubt verify` is an explicit, opt-in exception: it retrieves the source URLs
already present in the map and compares normalized visible text with each
recorded excerpt. It does not upload the map or excerpt to a Doubt service.
HTTP redirects are followed manually and every destination is checked; loopback,
private, link-local, carrier-grade NAT, benchmark, and multicast IP ranges are
blocked unless the caller passes `--allow-private`. Responses are limited to
text-like content, five redirects, 5 MB per source, and a default ten-second
timeout. DNS rebinding remains a limitation of the built-in Node HTTP stack;
do not run verification on attacker-controlled URLs from a network that can
reach sensitive HTTP services.

Map strings are HTML-escaped before rendering and embedded JSON escapes markup
delimiters. Source URLs remain user-supplied clickable links in the output; a
valid schema does not establish that a destination is safe or truthful. Review
untrusted maps before opening their external links.

Installation writes only to the selected agent skill directory. Use
`doubt doctor` to detect missing or locally modified installed copies.
