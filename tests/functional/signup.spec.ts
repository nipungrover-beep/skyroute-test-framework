import { test, expect } from '@playwright/test';
import { SignupPage } from '../../src/pages/SignupPage';
import { uniqueSignupIdentity } from '../../src/utils/testData';

test.describe('Sign up', () => {
  test('a unique, valid identity can sign up successfully', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const signup = new SignupPage(page);
    const identity = uniqueSignupIdentity();
    await signup.goto();
    await signup.signUp(identity);

    // Successful signup stays on /signup but swaps the form for an inline
    // confirmation message (it doesn't redirect or log the user in).
    await expect(page.getByTestId('signup-success')).toBeVisible();
  });

  test('password shorter than 10 characters is rejected', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const signup = new SignupPage(page);
    const identity = uniqueSignupIdentity();
    await signup.goto();
    await signup.signUp({ ...identity, password: 'Aa1!Aa1!' }); // 8 chars

    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByTestId('signup-error')).toHaveText(/at least 10 characters/i);
  });

  test('password without special characters is rejected', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const signup = new SignupPage(page);
    const identity = uniqueSignupIdentity();
    await signup.goto();
    await signup.signUp({ ...identity, password: 'AbcdefghijK1' }); // no special chars

    await expect(page).toHaveURL(/\/signup/);
  });

  test('mismatched confirm-password is rejected', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const signup = new SignupPage(page);
    const identity = uniqueSignupIdentity();
    await signup.goto();
    await signup.emailInput.fill(identity.email);
    await signup.mobileInput.fill(identity.mobile);
    await signup.passwordInput.fill(identity.password);
    await signup.confirmPasswordInput.fill(identity.password + 'x');
    await signup.signUpButton.click();

    await expect(page).toHaveURL(/\/signup/);
  });

  test('duplicate email is rejected on second signup', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const signup = new SignupPage(page);
    const identity = uniqueSignupIdentity();

    await signup.goto();
    await signup.signUp(identity);

    await signup.goto();
    await signup.signUp({ ...identity, mobile: uniqueSignupIdentity().mobile });
    await expect(page).toHaveURL(/\/signup/);
  });
});
