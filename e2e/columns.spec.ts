import { test, expect } from "@playwright/test";
import { columnTest } from "@fixtures/column";
import { updateUserSession } from "@helpers/api";

test.describe("testing columns", () => {
  test.describe.configure({mode: "parallel"});

  columnTest("should create a column on the right", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const firstColumn = page.getByRole("region", {name: "Start", exact: true});
    await expect(firstColumn).toBeVisible();

    const columnSettings = firstColumn.getByRole("button", {name: "Column settings"});
    await columnSettings.click();
    const addColumnRight = page.getByRole("button", {name: "Add column right"});
    await addColumnRight.click();

    const nameInput = page.getByRole("textbox", {name: "Column name"});
    await expect(nameInput).toBeVisible();
    await nameInput.fill("New Right Column");
    const saveButton = page.getByRole("button", {name: "Save"});
    await saveButton.click();

    const newColumn = page.getByRole("region", {name: "New Right Column"});
    await expect(newColumn).toBeVisible();
  });

  columnTest("should create a column on the left", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const secondColumn = page.getByRole("region", {name: "Stop", exact: true});
    await expect(secondColumn).toBeVisible();

    const columnSettings = secondColumn.getByRole("button", {name: "Column settings"});
    await columnSettings.click();
    const addColumnLeft = page.getByRole("button", {name: "Add column left"});
    await addColumnLeft.click();

    const nameInput = page.getByRole("textbox", {name: "Column name"});
    await expect(nameInput).toBeVisible();
    await nameInput.fill("New Left Column");
    await page.getByRole("button", {name: "Save"}).click();

    const newColumn = page.getByRole("region", {name: "New Left Column"});
    await expect(newColumn).toBeVisible();
  });

  columnTest("should delete a column", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const stopColumn = page.getByRole("region", {name: "Stop", exact: true});
    await expect(stopColumn).toBeVisible();

    const columnSettings = stopColumn.getByRole("button", {name: "Column settings"});
    await columnSettings.click();
    const deleteColumn = page.getByRole("button", {name: "Delete column", exact: true});
    await deleteColumn.click();

    await expect(stopColumn).not.toBeVisible();
  });

  columnTest("should change the color of a column", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    await expect(startColumn).toBeVisible();

    const columnSettings = startColumn.getByRole("button", {name: "Column settings"});
    await columnSettings.click();
    const changeColor = page.getByRole("button", {name: "Change color", exact: true});
    await changeColor.click();

    const blue = page.getByRole("button", {name: "Backlog Blue"});
    await blue.click();

    await columnSettings.click();
    const currentColor = page.getByRole("button", {name: "current color Backlog Blue"});
    await expect(currentColor).toBeVisible();
  });

  columnTest("should change the visability of a column from visable to hidden", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    await expect(startColumn).toBeVisible();

    const columnSettings = startColumn.getByRole("button", {name: "Column settings"});
    await columnSettings.click();
    const hideColumn = page.getByRole("button", {name: "Hide the column"});
    await hideColumn.click();

    await columnSettings.click();
    const showColumn = page.getByRole("button", {name: "Show the column"});
    await expect(showColumn).toBeVisible();
  });

  columnTest("should change the visability of a column from hidden to visable", async ({page, column}) => {
    await updateUserSession(page, column.boardId, column.userId, {showHiddenColumns: true});

    await page.goto(`/board/${column.boardId}`);

    const startColumn = page.getByRole("region", {name: "Continue", exact: true});
    await expect(startColumn).toBeVisible();

    const columnSettings = startColumn.getByRole("button", {name: "Column settings"});
    await columnSettings.click();
    const showColumn = page.getByRole("button", {name: "Show the column"});
    await showColumn.click();

    await columnSettings.click();
    const hideColumn = page.getByRole("button", {name: "Hide the column"});
    await expect(hideColumn).toBeVisible();
  });

  columnTest("should change the name of the column via edit menu", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    const columnSettings = startColumn.getByRole("button", {name: "Column settings"});
    await columnSettings.click();
    const changeName = page.getByRole("button", {name: "Change the name"});
    await changeName.click();

    const nameInput = page.getByRole("textbox", {name: "Column name"});
    await expect(nameInput).toHaveValue("Start");
    await nameInput.fill("Start Edited");

    const save = page.getByRole("button", {name: "Save"});
    await save.click();

    await expect(page.getByRole("region", {name: "Start Edited"})).toBeVisible();
    await expect(page.getByRole("region", {name: "Start", exact: true})).not.toBeVisible();
  });

  columnTest("should change the name of the column via edit icon", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    await startColumn.hover();
    const editButton = startColumn.getByRole("button", {name: "Edit column name"});
    await editButton.click();

    const nameInput = page.getByRole("textbox", {name: "Column name"});
    await expect(nameInput).toHaveValue("Start");
    await nameInput.fill("Start Icon Edited");

    const save = page.getByRole("button", {name: "Save"});
    await save.click();

    await expect(page.getByRole("region", {name: "Start Icon Edited"})).toBeVisible();
  });

  columnTest("should change the name of a column via double click", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    const columnName = startColumn.getByRole("button", {name: "Start"});
    await columnName.click();

    const nameInput = page.getByRole("textbox", {name: "Column name"});
    await expect(nameInput).toHaveValue("Start");
    await nameInput.fill("Start Click Edited");

    const save = page.getByRole("button", {name: "Save"});
    await save.click();

    await expect(page.getByRole("region", {name: "Start Click Edited"})).toBeVisible();
  });

  columnTest("should add a description to a column", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    const description = startColumn.getByRole("button", {name: "Add description (optional)"});
    await description.click();

    const descriptionInput = page.getByRole("textbox", {name: "Column description"}).first();
    await descriptionInput.fill("Things we should start doing");

    const save = page.getByRole("button", {name: "Save"});
    await save.click();

    await expect(startColumn.getByRole("textbox", {name: "Column description"})).toHaveValue("Things we should start doing");
  });

  columnTest("should edit the description of a column via edit menu", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const stopColumn = page.getByRole("region", {name: "Stop", exact: true});
    const columnSettings = stopColumn.getByRole("button", {name: "Column settings"});
    await columnSettings.click();
    const changeName = page.getByRole("button", {name: "Change the name"});
    await changeName.click();

    const description = stopColumn.getByRole("textbox", {name: "Column description"});
    await expect(description).toHaveValue("Initial description");
    await description.fill("Updated description via menu");

    const save = page.getByRole("button", {name: "Save"});
    await save.click();

    await expect(stopColumn.getByRole("textbox", {name: "Column description"})).toHaveValue("Updated description via menu");
  });

  columnTest("should edit the description of a column via edit icon", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const stopColumn = page.getByRole("region", {name: "Stop", exact: true});
    await stopColumn.hover();
    const editButton = stopColumn.getByRole("button", {name: "Edit column name"});
    await editButton.click();

    const description = stopColumn.getByRole("textbox", {name: "Column description"});
    await expect(description).toHaveValue("Initial description");
    await description.fill("Updated description via icon");

    const save = page.getByRole("button", {name: "Save"});
    await save.click();

    await expect(stopColumn.getByRole("textbox", {name: "Column description"})).toHaveValue("Updated description via icon");
  });

  columnTest("should remove the description of a column", async ({page, column}) => {
    await page.goto(`/board/${column.boardId}`);

    const stopColumn = page.getByRole("region", {name: "Stop", exact: true});
    await stopColumn.hover();
    const editButton = stopColumn.getByRole("button", {name: "Edit column name"});
    await editButton.click();

    const description = stopColumn.getByRole("textbox", {name: "Column description"});
    await expect(description).toHaveValue("Initial description");
    await description.fill("");

    const save = page.getByRole("button", {name: "Save"});
    await save.click();

    await expect(stopColumn.getByRole("button", {name: "Add description (optional)"})).toBeVisible();
  });
});
