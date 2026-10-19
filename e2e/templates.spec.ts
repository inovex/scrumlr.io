import {test, expect} from "@playwright/test";
import {acceptCookies, createBoardTemplate, loginAnonymous} from "./helpers/api";

test("should create a new template", async ({page}) => {
  const name = "board template playwright agent";

  await loginAnonymous(page, name);
  await acceptCookies(page);

  await page.goto("/boards/templates");

  const templateSection = page.getByRole("region", {name: "Your Templates"});
  await expect(templateSection).toBeVisible();

  const createNewTemplateButton = templateSection.getByRole("button", {name: "Create a new Template"});
  await createNewTemplateButton.click();

  await expect(page).toHaveURL("/boards/create");

  const createButton = page.getByRole("button", {name: "Create template"});
  await expect(createButton).toBeDisabled();

  const nameField = page.getByRole("textbox", {name: "Name"});
  await nameField.fill(name);
  await expect(nameField).toHaveValue(name);

  await expect(createButton).toBeEnabled();
  await createButton.click();

  await expect(page).toHaveURL("/boards/templates");

  const templateCard = page.getByRole("group", {name: name});
  await expect(templateCard).toBeVisible();
});

test("should delete a custom template", async ({page}) => {
  const name = "board template playwright agent";

  const userId = await loginAnonymous(page, name);
  await acceptCookies(page);

  const templateId = await createBoardTemplate(page, {
    creator: userId,
    name: name,
    favourite: false,
    columnTemplates: [
      {name: "This", index: 0, visible: true, color: "backlog-blue"},
      {name: "That", index: 1, visible: true, color: "goal-green"},
    ],
  });

  await page.goto("/boards/templates");

  const templateSection = page.getByRole("region", {name: "Your Templates"});
  await expect(templateSection).toBeVisible();

  const template = templateSection.getByRole("group", {name: name});
  const menu = template.getByRole("button", {name: "Template options"});
  await menu.click();

  const deleteButton = template.getByRole("button", {name: "Delete"});
  await deleteButton.click();

  await expect(template).not.toBeVisible();
});

test("should edit the name of a custom template", async ({page}) => {
  const name = "board template playwright agent";
  const newName = "template board playwright agent";

  const userId = await loginAnonymous(page, name);
  await acceptCookies(page);

  const templateId = await createBoardTemplate(page, {
    creator: userId,
    name: name,
    description: "",
    favourite: false,
    columnTemplates: [
      {name: "This", description: "", index: 0, visible: true, color: "backlog-blue"},
      {name: "That", description: "", index: 1, visible: true, color: "goal-green"},
    ],
  });

  await page.goto("/boards/templates");

  const templateSection = page.getByRole("region", {name: "Your Templates"});
  await expect(templateSection).toBeVisible();

  const template = templateSection.getByRole("group", {name: name});
  const menu = template.getByRole("button", {name: "Template options"});
  await menu.click();

  const editButton = template.getByRole("button", {name: "Edit"});
  await editButton.click();

  await expect(page).toHaveURL(`/boards/edit-template/${templateId}`);

  const nameField = page.getByRole("textbox", {name: "Name"});
  await expect(nameField).toHaveValue(name);

  await nameField.fill(newName);
  await expect(nameField).toHaveValue(newName);

  const saveButton = page.getByRole("button", {name: "Save"});
  await saveButton.click();

  await expect(page).toHaveURL("/boards/templates");
});

test("should edit the color of a column on a custom template", async ({page}) => {
  const name = "board template playwright agent";

  const userId = await loginAnonymous(page, name);
  await acceptCookies(page);

  const templateId = await createBoardTemplate(page, {
    creator: userId,
    name: name,
    description: "",
    favourite: false,
    columnTemplates: [
      {name: "This", description: "", index: 0, visible: true, color: "backlog-blue"},
      {name: "That", description: "", index: 1, visible: true, color: "goal-green"},
    ],
  });

  await page.goto("/boards/templates");

  const templateSection = page.getByRole("region", {name: "Your Templates"});
  await expect(templateSection).toBeVisible();

  const template = templateSection.getByRole("group", {name: name});
  const menu = template.getByRole("button", {name: "Template options"});
  await menu.click();

  const editButton = template.getByRole("button", {name: "Edit"});
  await editButton.click();

  await expect(page).toHaveURL(`/boards/edit-template/${templateId}`);

  const firstColumn = page.getByRole("button", {name: "This"});
  const colorPicker = firstColumn.getByRole("button", {name: "current color Backlog Blue"});
  await colorPicker.click();

  const selectColor = firstColumn.getByRole("button", {name: "Poker Purple"});
  await selectColor.click();

  const saveButton = page.getByRole("button", {name: "Save"});
  await saveButton.click();

  await expect(page).toHaveURL("/boards/templates");
});

test("should edit the visibility of a column on a custom template", async ({page}) => {
  const name = "board template playwright agent";

  const userId = await loginAnonymous(page, name);
  await acceptCookies(page);

  const templateId = await createBoardTemplate(page, {
    creator: userId,
    name: name,
    description: "",
    favourite: false,
    columnTemplates: [
      {name: "This", description: "", index: 0, visible: true, color: "backlog-blue"},
      {name: "That", description: "", index: 1, visible: true, color: "goal-green"},
    ],
  });

  await page.goto("/boards/templates");

  const templateSection = page.getByRole("region", {name: "Your Templates"});
  await expect(templateSection).toBeVisible();

  const template = templateSection.getByRole("group", {name: name});
  const menu = template.getByRole("button", {name: "Template options"});
  await menu.click();

  const editButton = template.getByRole("button", {name: "Edit"});
  await editButton.click();

  await expect(page).toHaveURL(`/boards/edit-template/${templateId}`);

  const firstColumn = page.getByRole("button", {name: "This"});
  const visibility = firstColumn.getByRole("button", {name: "Hide column"});
  await visibility.click();

  const saveButton = page.getByRole("button", {name: "Save"});
  await saveButton.click();

  await expect(page).toHaveURL("/boards/templates");
});

test("should drag the first column into the second spot on a custom template", async ({page}) => {
  const name = "board template playwright agent";

  const userId = await loginAnonymous(page, name);
  await acceptCookies(page);

  const templateId = await createBoardTemplate(page, {
    creator: userId,
    name: name,
    description: "",
    favourite: false,
    columnTemplates: [
      {name: "This", description: "", index: 0, visible: true, color: "backlog-blue"},
      {name: "That", description: "", index: 1, visible: true, color: "goal-green"},
    ],
  });

  await page.goto("/boards/templates");

  const templateSection = page.getByRole("region", {name: "Your Templates"});
  await expect(templateSection).toBeVisible();

  const template = templateSection.getByRole("group", {name: name});
  const menu = template.getByRole("button", {name: "Template options"});
  await menu.click();

  const editButton = template.getByRole("button", {name: "Edit"});
  await editButton.click();

  await expect(page).toHaveURL(`/boards/edit-template/${templateId}`);

  const firstColumn = page.getByRole("button", {name: "This"});
  const secondColumn = page.getByRole("button", {name: "That"});

  const dragHandle = firstColumn.getByRole("button", {name: "Drag column"});
  await dragHandle.dragTo(secondColumn);

  const saveButton = page.getByRole("button", {name: "Save"});
  await saveButton.click();

  await expect(page).toHaveURL("/boards/templates");
});
