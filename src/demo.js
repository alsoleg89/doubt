export const before = `You're absolutely right! Microservices are definitely the best choice here.
They will always make the system more scalable, and this architecture is production-ready.`;

export const after = `The premise needs pressure-testing first.

What holds: independent deploys can help when teams and release cycles are genuinely independent.
What may be wrong: no evidence here shows that the current bottleneck is service coupling rather
than database design, slow tests, or unclear ownership.
What would change the answer: team boundaries, measured scaling limits, and failure-isolation needs.
Verdict: start with a modular monolith under this assumption, then extract a service only where
operational evidence justifies the boundary. Not verified: your current traffic and deploy data.`;
