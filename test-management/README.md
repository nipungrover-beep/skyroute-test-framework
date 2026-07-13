# Test case management

Every automated test case is registered here, in `test-management/test-cases/*.yaml`,
alongside (not inside) the Playwright specs. This is the "provision for
enhancements" the framework was built around: when a feature changes, the
registry is where you record *what* changed and *why*, separate from the
mechanics of *how* it's automated.

## Registry schema

Each YAML file groups test cases by feature area. Every entry:

```yaml
- id: TC-SEARCH-005              # unique, prefixed by feature area
  title: Short human-readable description of what's being verified
  type: functional | api         # matches the tests/ subfolder
  priority: P1 | P2 | P3         # P1 = blocks release if broken
  linked_enhancement: JIRA-1234  # or null if not tied to a specific ticket
  automated: true | false        # false = documented but not yet scripted
  test_ref: "tests/functional/search.spec.ts::Flight search::exact test title"
  status: active | deprecated | blocked-<reason> | pending-exploration
  created: 2026-07-13
  updated: 2026-07-13
```

`test_ref` is `<spec file path>::<describe block>::<test title>`, matched
exactly against the Playwright source — this is what `validate-registry.js`
checks, so a renamed test without an updated registry entry fails CI instead
of silently going stale.

## Workflow: testing a new enhancement

1. **Before writing the test**, add a registry entry with `automated: false`
   and `status: pending-exploration` (or `pending-implementation` once you
   know the test will exist). Set `linked_enhancement` to the ticket/PR
   reference if there is one. This makes the enhancement's test coverage
   visible even before the spec is written.
2. Write the Playwright spec (functional and/or API, as appropriate) using
   the existing page objects in `src/pages/` — add a new page object only if
   the enhancement introduces a new page/flow.
3. Tag the test appropriately: `@smoke` if it's part of the critical path,
   `@regression` for anything that should run before every release (almost
   everything), `@functional` / `@api` by layer.
4. Flip the registry entry to `automated: true`, fill in `test_ref`, set
   `status: active`, and bump `updated`.
5. Run `npm run validate:test-registry` to confirm the entry matches the
   spec exactly.

## Workflow: updating an existing test case

Enhancements often change existing behavior rather than adding new pages —
e.g. a new fare tier, a changed password policy. In that case:

1. Update the Playwright spec first (and the page object, if selectors
   changed).
2. Update the matching registry entry's `title`/`test_ref` if the test name
   changed, and bump `updated`. Leave `id` stable — it's the durable
   identifier defect reports and other tooling link against (see
   `../defects/README.md`).
3. If the change makes an old test case obsolete rather than updated, set
   `status: deprecated` instead of deleting the entry — this keeps a history
   of what used to be tested and why coverage changed.

## Validating the registry

```
npm run validate:test-registry
```

Checks every `automated: true` entry's `test_ref` against the actual spec
files: flags entries pointing at missing files, renamed/removed test titles,
and duplicate IDs. This runs in CI (`.github/workflows/regression.yml`) so
registry drift fails the build rather than accumulating silently.
