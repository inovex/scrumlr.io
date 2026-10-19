import {test, expect} from "@playwright/test";
import {acceptCookies, createBoard, loginAnonymous} from "./helpers/api";

test("should logout", async ({page}) => {
  const name = "logout playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/");

  const logoutButton = page.getByRole("button", {name: "Logout"});
  await logoutButton.click();

  await expect(page).toHaveURL("/login");
});

test("should logout and not redirect to prevoius users board", async ({page}) => {
  const name = "logout playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.on("dialog", (dialog) => dialog.accept());

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
  await nameField.fill(name);

  await expect(nameField).toHaveValue(name);

  const loginButton = page.getByRole("button", {name: "Continue anonymously", exact: true});
  await loginButton.click();

  await expect(page).toHaveURL("/boards/templates");
});
