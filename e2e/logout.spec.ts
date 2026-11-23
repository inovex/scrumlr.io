import { test, expect } from "@playwright/test";
import { logoutTest } from "@fixtures/logout";
import { createBoard } from "@helpers/api";

test.describe("testing logout", () => {
  test.describe.configure({mode: "parallel"});

  logoutTest("should logout", async ({page, logout}) => {
    await page.goto("/");

    const logoutButton = page.getByRole("button", {name: "Logout"});
    await logoutButton.click();

    await expect(page).toHaveURL("/login");
  });

  logoutTest("should logout and not redirect to prevoius users board", async ({page, logout}) => {
    const boardId = await createBoard(page, {
      name: "Mark as done",
      accessPolicy: "PUBLIC",
      columns: [
        {name: "Start", color: "goal-green", index: 0, visible: true},
        {name: "Stop", color: "online-orange", index: 1, visible: true},
        {name: "Continue", color: "yielding-yellow", index: 2, visible: true},
        {name: "Action", color: "poker-purple", index: 3, visible: false},
      ],
    });

    await page.goto(`/board/${boardId}`);

    const profileButton = page.getByRole("button", {name: "Show profile settings"});
    await profileButton.click();

    await expect(page.getByRole("heading", {name: "Profile"})).toHaveText("Profile");

    const logoutButton = page.getByRole("button", {name: "Logout"});
    await logoutButton.click();

    await expect(page).toHaveURL("/login");

    // login again
    const loginAnonymousButton = page.getByRole("button", {name: "Continue anonymously as a guest (limited features)"});
    await loginAnonymousButton.click();

    const nameField = page.getByRole("textbox");
    await nameField.fill(logout.userName);

    await expect(nameField).toHaveValue(logout.userName);

    const loginButton = page.getByRole("button", {name: "Continue anonymously", exact: true});
    await loginButton.click();

    await expect(page).toHaveURL("/boards/templates");
  });
});
