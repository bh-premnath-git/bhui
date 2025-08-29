import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check that the page title is set
  await expect(page).toHaveTitle(/BH UI/);
  
  // Check that main content is visible
  await expect(page.locator('body')).toBeVisible();
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Test basic page functionality
  // Add more specific tests based on your app's navigation structure
});
