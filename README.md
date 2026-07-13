# SkyRoute test execution framework

Playwright + TypeScript framework covering functional, API, smoke, and
regression testing for SkyRoute (domestic flight search), running at
`http://localhost:5173` in development.

Built via black-box exploration (no access to the app's source repo — see
**Known gaps** below), so selectors are based on visible text/roles rather
than `data-testid` attributes. Recommend adding stable `data-testid`s to the
app if/when the source becomes available — see Known gaps.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # edit BASE_URL / TEST_USER_EMAIL / TEST_USER_PASSWORD if needed
```

The app must already be running (e.g. `npm run dev` in the SkyRoute repo,
serving on `http://localhost:5173`) before running tests — this framework
doesn't start it for you locally.

## Running tests

```bash
npm test                  # everything
npm run test:smoke        # @smoke only — critical path, run this on every change
npm run test:functional   # tests/functional only
npm run test:api          # tests/api only
npm run test:regression   # @regression tag — full suite, run before each release
npm run test:headed       # any of the above with a visible browser, e.g.:
npx playwright test --headed --grep @smoke
npm run report            # open the last HTML report
```

Reports land in `reports/<RELEASE_TAG>/` (HTML + JSON), so consecutive runs
under different `RELEASE_TAG` values don't overwrite each other — see
**Release cadence** below.

## Structure

```
src/pages/          Page Object Model — one class per page/flow
src/api/             ApiClient.ts — typed wrapper over the REST endpoints
src/utils/            Shared test data helpers (routes, dates, unique identities)
tests/functional/     UI flows: search, results, fare/seat, confirm, login, signup
tests/api/             Direct API tests for each endpoint
test-management/       Test case registry + workflow for enhancements (see its README)
defects/                Defect history + RCA (see its README)
.github/workflows/     CI: smoke on every push, regression on schedule/release
```

## Test case management, defects, and RCA

These aren't bolted on — they're the parts of this framework built
specifically for your stated requirements:

- **`test-management/`** — every test case is registered with an id,
  priority, and link to the enhancement that introduced it. When a feature
  changes, you update the registry alongside the test, and
  `npm run validate:test-registry` catches drift (a registry entry pointing
  at a renamed/deleted test) automatically, including in CI.
- **`defects/`** — `defects.json` is the defect log; `node
  defects/scripts/new-defect.js ...` files a new one and auto-scaffolds an
  RCA doc for Critical/High severity. Each defect links back to the test
  case that caught it (or should have) — see `defects/README.md` for the
  full workflow, including how RCAs are expected to produce new test
  coverage, not just a fix.

## Release cadence (every 2-3 weeks)

The framework assumes a recurring release rhythm rather than continuous
one-off runs:

1. Set `RELEASE_TAG` (e.g. `2026.07-R2`) as an env var or via the
   `workflow_dispatch` input when running regression — this namespaces the
   report under `reports/2026.07-R2/` and tags defects raised during that
   pass (`release_found`).
2. Before cutting a release: run `npm run test:regression`, review
   `defects.json` filtered to `status != Closed`, and make the ship/no-ship
   call explicitly rather than assuming green tests mean zero open issues.
3. Tag the release in git as `release/<tag>` — `.github/workflows/
   regression.yml` runs automatically on that tag push, giving you an
   archived, dated regression report per release for comparison later.
4. New/changed features in that release should already have registry
   entries per `test-management/README.md` before the release regression
   run — the workflow is designed so test coverage isn't written
   retroactively after a defect is found.

## Known gaps (from black-box exploration — revisit if source becomes available)

- **No source code access.** Everything here was reverse-engineered by
  clicking through the running app and reading network requests. Selectors
  favor visible text/ARIA roles; they're more readable but more brittle
  than `data-testid` hooks would be. If the SkyRoute repo becomes
  accessible, revisit `src/pages/*.ts` — swapping in test IDs would make
  every locator sturdier.
- **No test account.** Positive-path login/signup-then-login flows are
  either `test.skip`'d (pending `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` in
  `.env`) or exercise the *signup* flow with freshly generated identities
  each run (see `src/utils/testData.ts::uniqueSignupIdentity`), since no
  seeded account was available during exploration.
- **Forgot-password flow** was located but its form fields weren't
  explored (out of scope for the initial pass) — `tests/functional/
  forgot-password.spec.ts` has a `test.fixme` placeholder and a
  `pending-exploration` registry entry (`TC-AUTH-006`) rather than a real
  assertion.
- **Seat-unavailability selector** (`TC-FARESEAT-002`) currently guards
  itself with `test.skip` if it can't find a `disabled`/`aria-disabled`
  attribute on unavailable seats — the app may only communicate this via
  CSS class, which the initial exploration pass couldn't confirm reliably.
  Filed as `DEF-0001` in `defects/defects.json` as an example of the
  defect-log workflow.
- **CI app-startup step is a placeholder.** `.github/workflows/*.yml` have
  a `TODO` where the app-under-test needs to be started (or pointed at a
  staging URL) — see the comments in those files.
