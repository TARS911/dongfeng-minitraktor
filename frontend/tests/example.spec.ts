import { test, expect } from '@playwright/test';

test('homepage has title and links to catalog', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/БелТехФермЪ/);

  const catalogLink = page.getByRole('link', { name: 'Каталог' });

  await expect(catalogLink).toBeVisible();

  await catalogLink.click();

  await expect(page).toHaveURL('/catalog');
});
