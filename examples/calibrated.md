The premise needs pressure-testing.

What holds: independent deployments can help when teams and release cycles are genuinely
independent.

What may be wrong: no evidence here shows that service coupling is the current bottleneck rather
than database design, slow tests, or unclear ownership.

What would change the answer: team boundaries, measured scaling limits, and failure-isolation
requirements.

Verdict: start with a modular monolith under this assumption, then extract a service where
operational evidence justifies the boundary. Not verified: current traffic and deployment data.
