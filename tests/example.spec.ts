import { test, expect } from '@playwright/test';

test("test", async ({page}) => {
  await page.goto("localhost:3000");
  await expect(page).toHaveTitle("scrumlr.io - Online collaboration");
});
