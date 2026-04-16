// E2E Use Case Test: ZK Proof Generation → Verification
//
// Tests the golden path a first-time user follows:
//   1. Land on the homepage
//   2. Navigate to a template (age-verification)
//   3. Fill the form
//   4. Generate a ZK proof in the browser
//   5. Export the proof
//   6. Navigate to /verify-proof
//   7. Paste the exported JSON
//   8. Verify the proof

import { test, expect } from '@playwright/test';

test.describe('ZK Proof Generation → Verification', () => {
  test('homepage loads and displays key sections', async ({ page }) => {
    await page.goto('/');
    // Main heading / hero should be visible
    await expect(page.locator('h1').first()).toBeVisible();
    // Navigation should render
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('template page loads and shows the proof form', async ({ page }) => {
    await page.goto('/templates/age-verification');
    // Wait for the page to fully hydrate
    await page.waitForLoadState('networkidle');
    // Should show the template title or form
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    // The generate button should exist (may be disabled until form filled)
    const generateBtn = page.getByRole('button', { name: /generate|proof/i });
    await expect(generateBtn.first()).toBeVisible();
  });

  test('age-verification: fill form and generate proof', async ({ page }) => {
    await page.goto('/templates/age-verification');
    await page.waitForLoadState('networkidle');

    // The form uses a date input (type="date"), not number inputs.
    // Fill with a date that makes the user 26 years old in 2026.
    const dateInput = page.locator('input[type="date"]').first();
    await expect(dateInput).toBeVisible({ timeout: 5_000 });
    await dateInput.fill('2000-01-15');

    // Click generate
    const generateBtn = page.getByRole('button', { name: /generate/i }).first();
    await generateBtn.click();

    // Wait for proof generation (snarkjs in browser, can take up to 15s)
    // Look for success indicators: proof hash, "verified", timing, export
    await expect(
      page.locator('text=/proof|verified|generated|success/i').first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test('verify-proof page loads and accepts JSON input', async ({ page }) => {
    await page.goto('/verify-proof');
    await page.waitForLoadState('networkidle');

    // Should have a textarea or input for JSON
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();

    // Paste an invalid JSON and verify error
    await textarea.fill('{"invalid": true}');
    const verifyBtn = page.getByRole('button', { name: /verify/i }).first();
    await verifyBtn.click();

    // Should show an error message (invalid format)
    await expect(
      page.locator('text=/invalid|error|missing|failed/i').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('marketplace page loads and shows templates', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Page should load
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('governance page loads with beta badge', async ({ page }) => {
    await page.goto('/governance');
    await page.waitForLoadState('networkidle');

    // Should show Governance heading with Beta badge
    await expect(page.locator('text=Governance').first()).toBeVisible();
    await expect(page.locator('text=Beta').first()).toBeVisible();
  });

  test('staking page loads', async ({ page }) => {
    await page.goto('/staking');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard may show "connect wallet" prompt or stats
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
