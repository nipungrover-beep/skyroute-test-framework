# Defect history & RCA

`defects.json` is the defect log — every bug found by (or reported against)
this test suite gets an entry here, whether it was caught by an automated
run or filed manually. `rca/` holds root-cause-analysis writeups for
Critical/High severity defects.

This is intentionally file-based and version-controlled: defect history
travels with the code, survives across releases, and diffs cleanly in PRs.
If the team later adopts Jira/TestRail/etc., this log's fields map directly
onto those tools' schemas — see the field descriptions below.

## Adding a defect

```
node defects/scripts/new-defect.js \
  --title "Sort by price does not re-sort after filter change" \
  --severity High \
  --linked-test-case TC-RESULTS-001 \
  --steps "Search DEL->BOM;Sort by price;Apply nonstop filter" \
  --expected "List stays sorted by price after filtering" \
  --actual "List reverts to default (unsorted) order" \
  --release-found 2026.07-R2
```

This assigns the next `DEF-XXXX` ID, appends the entry to `defects.json`,
and — for `Critical`/`High` severity — scaffolds an RCA file at
`rca/DEF-XXXX-rca.md` from `rca/_TEMPLATE.md`, since those severities require
one by convention. Fill in the RCA before closing the defect.

## Fields

| Field | Meaning |
|---|---|
| `id` | Stable identifier, `DEF-0001` style |
| `severity` | Critical / High / Medium / Low |
| `status` | Open / In Progress / Fixed / Verified / Closed / Won't Fix |
| `linked_test_case` | The `TC-XXX-XXX` id from `test-management/test-cases/` that caught it, or that should be added to catch it |
| `linked_enhancement` | Ticket reference, if the defect surfaced while testing a specific enhancement |
| `release_found` / `release_fixed` | Release tag (see root README > Release cadence) |
| `rca_ref` | Path to the RCA file, if one exists |

## Closing the loop with test coverage

A defect without a linked test case is a defect that can regress silently.
When you fix a defect:

1. Set `status` to `Fixed`, then `Verified` once confirmed, then `Closed`.
2. If no automated test caught it, add one (see
   `test-management/README.md`) and set `linked_test_case` to its new ID.
3. If there's an RCA, its "Preventive action" section should point at that
   same new/updated test case — this is the mechanism that actually reduces
   repeat defects release over release.

## Release-over-release view

Filter `defects.json` by `release_found` to see what a given release
introduced, or by `status != Closed` to see the open backlog going into the
next release. With releases every 2-3 weeks, it's worth a quick pass through
open defects before each release cut to make the ship/no-ship call
explicit rather than implicit.
