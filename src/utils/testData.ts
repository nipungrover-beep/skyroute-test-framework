/**
 * Shared, deterministic-where-possible test data helpers.
 * Keeping routes/dates here means enhancement tests can reuse known-good
 * data instead of every spec hardcoding its own.
 */

export const routes = {
  delhiToMumbai: { origin: 'Del', destination: 'Bom', originCode: 'DEL', destinationCode: 'BOM' },
};

/** Returns a departure date N days from "now" as YYYY-MM-DD, used for both
 *  the UI date field (via `.fill()`) and API calls. Avoids hardcoded dates
 *  going stale as releases roll forward. */
export function futureDate(daysFromNow = 30): { iso: string } {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return { iso: `${yyyy}-${mm}-${dd}` };
}

/** Generates a unique signup identity so repeated test runs don't collide
 *  on "email already registered" in the app's dev database. */
export function uniqueSignupIdentity() {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    email: `qa.auto.${stamp}@example.com`,
    mobile: `9${stamp.slice(-9).padStart(9, '0')}`,
    // Meets the app's rule: 3-20 chars, starts with a letter, letters/numbers/_/. only.
    username: `qa${stamp.slice(-10)}`,
    // Meets the app's rule: 10+ chars, letters, numbers, 2+ special characters.
    password: `Qa!Test${stamp}!#`,
  };
}
