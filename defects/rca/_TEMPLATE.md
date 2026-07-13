# RCA: DEF-XXXX — <title>

| Field | Value |
|---|---|
| Defect ID | DEF-XXXX |
| Severity | Critical / High / Medium / Low |
| Release found in | e.g. 2026.07-R2 |
| Release fixed in | e.g. 2026.08-R1 |
| Linked test case(s) | TC-XXX-XXX |
| Owner | |

## Summary

One or two sentences: what broke, what the user-visible impact was.

## Timeline

- **Detected**: how/when it was caught (automated smoke run, manual QA, user report)
- **Triaged**: when severity/priority was assigned
- **Fixed**: when a fix landed
- **Verified**: when the fix was confirmed (link the test run / test case)

## Root cause

What actually caused it — not just "what broke" but *why* the system let it
happen. Distinguish the immediate trigger from the underlying cause (e.g.
"a null check was missing" is the trigger; "the API contract change wasn't
communicated to the frontend team" may be the underlying cause).

## Detection gap

Why didn't the existing test suite catch this before it reached this stage?
Was there no test case for this path? Was the test flaky/skipped? Was the
scenario genuinely new (introduced by this release)? This section is what
turns an RCA into a coverage improvement — be specific.

## Corrective action

What was done to fix the immediate issue.

## Preventive action

What changes (new test case(s), registry updates, process changes) prevent
this class of defect from recurring. Link the new/updated entry in
`test-management/test-cases/` here — every RCA should produce at least one
registry change, closing the detection gap identified above.

## Follow-up

- [ ] New/updated test case added to registry (link: )
- [ ] Registry validated (`npm run validate:test-registry`)
- [ ] Regression suite re-run and green
