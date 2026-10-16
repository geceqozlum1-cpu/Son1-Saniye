# Spark rules review — 2026-10-16

Tested using Firestore emulator with independent authenticated identities. No live production database was modified.

Passing scenarios: create/join, duplicate join, identical daily parkur, real elapsed match completion, two players' visible scores, idempotent submission, abort/restart, 5-league cap, 20-attempt client guard, full-league guard, invalid invite and malformed events.

Denied attacks: unauthenticated metadata access, league enumeration, nonmember roster query, foreign private profile and ticket reads, owner replacement, isolated membership-counter increment, league/ticket deletion, foreign member writes, arbitrary score writes, negative/overflow/wrong-type scores, oversized alias, UID replacement, injected admin field, joinedAt replacement, played rollback, orphan/forged member creation, malformed or modified ticket, invalid round timing/points, transcript-size mismatch, wrong match ID, extra part fields and saved-result edits. A valid submission after malicious batches confirms failures leave the ticket usable.

Three bounded parts (4 rounds each) allow independent rule-side score checks within Firestore's expression/access limits. The final ticket and member totals must be updated atomically with all parts; partial results are rejected. At most three part documents per member are overwritten, so normal matches do not create unbounded match history. There is no PII in invite metadata or member rosters.

Limits: a client can synthesize a plausible event transcript or automate valid input. Anonymous-account recreation can bypass per-UID quotas. Invitation codes are bearer invitations, not a substitute for private identity verification. These are community leagues, not prize-bearing or cheat-proof competition. Spark daily quotas can halt the service under heavy use. No claim of complete security or physical-device/live-server validation is made.
