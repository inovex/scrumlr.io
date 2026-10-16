import { test, expect } from "@playwright/test";

test("should successfully login anonymously", async ({ page }) => {
  const name = "Playwright test suite"

  await page.goto("/")

  const acceptCookies = page.getByRole("button", {name: "Accept"})
  await acceptCookies.click()

  const startButton = page.getByRole("button", {name: "Start now"})
  await startButton.click()

  await expect(page).toHaveURL("/login")

  const loginAnonymous = page.getByRole("button", {name: "Continue anonymously as a guest (limited features)"})
  await loginAnonymous.click()

  const nameField = page.getByRole("textbox")
  await nameField.fill(name)

  await expect(nameField).toHaveValue(name)

  const loginButton = page.getByRole("button", {name: "Continue anonymously", exact: true})
  await loginButton.click()

  await expect(page).toHaveURL("/boards/templates")
});
