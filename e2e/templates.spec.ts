import { test, expect } from "@playwright/test";
import { templateTest } from "@fixtures/template";

test.describe("testing templates", () => {
  test.describe.configure({mode: "parallel"});

  templateTest("should create a new template", async ({page, template}) => {
    const templateName = "create template test"

    await page.goto("/boards/templates");

    const templateSection = page.getByRole("region", {name: "Your Templates"});
    await expect(templateSection).toBeVisible();

    const createNewTemplateButton = templateSection.getByRole("button", {name: "Create a new Template"});
    await createNewTemplateButton.click();

    await expect(page).toHaveURL("/boards/create");

    const createButton = page.getByRole("button", {name: "Create template"});
    await expect(createButton).toBeDisabled();

    const nameField = page.getByRole("textbox", {name: "Name"});
    await nameField.fill(templateName);
    await expect(nameField).toHaveValue(templateName);

    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page).toHaveURL("/boards/templates");

    const templateCard = page.getByRole("group", {name: templateName});
    await expect(templateCard).toBeVisible();
  });

  templateTest("should delete a custom template", async ({page, template}) => {
    await page.goto("/boards/templates");

    const templateSection = page.getByRole("region", {name: "Your Templates"});
    await expect(templateSection).toBeVisible();

    const selectedTemplate = templateSection.getByRole("group", {name: template.templateName});
    const menu = selectedTemplate.getByRole("button", {name: "Template options"});
    await menu.click();

    const deleteButton = selectedTemplate.getByRole("button", {name: "Delete"});
    await deleteButton.click();

    await expect(selectedTemplate).not.toBeVisible();
  });

  templateTest("should edit the name of a custom template", async ({page, template}) => {
    const newTemplateName = "template board playwright agent";

    await page.goto("/boards/templates");

    const templateSection = page.getByRole("region", {name: "Your Templates"});
    await expect(templateSection).toBeVisible();

    const selectedTemplate = templateSection.getByRole("group", {name: template.templateName});
    const menu = selectedTemplate.getByRole("button", {name: "Template options"});
    await menu.click();

    const editButton = selectedTemplate.getByRole("button", {name: "Edit"});
    await editButton.click();

    await expect(page).toHaveURL(`/boards/edit-template/${template.templateId}`);

    const nameField = page.getByRole("textbox", {name: "Name"});
    await expect(nameField).toHaveValue(template.templateName);

    await nameField.fill(newTemplateName);
    await expect(nameField).toHaveValue(newTemplateName);

    const saveButton = page.getByRole("button", {name: "Save"});
    await saveButton.click();

    await expect(page).toHaveURL("/boards/templates");
  });

  templateTest("should edit the color of a column on a custom template", async ({page, template}) => {
    await page.goto("/boards/templates");

    const templateSection = page.getByRole("region", {name: "Your Templates"});
    await expect(templateSection).toBeVisible();

    const selectedTemplate = templateSection.getByRole("group", {name: template.templateName});
    const menu = selectedTemplate.getByRole("button", {name: "Template options"});
    await menu.click();

    const editButton = selectedTemplate.getByRole("button", {name: "Edit"});
    await editButton.click();

    await expect(page).toHaveURL(`/boards/edit-template/${template.templateId}`);

    const firstColumn = page.getByRole("button", {name: "This"});
    const colorPicker = firstColumn.getByRole("button", {name: "current color Backlog Blue"});
    await colorPicker.click();

    const selectColor = firstColumn.getByRole("button", {name: "Poker Purple"});
    await selectColor.click();

    const saveButton = page.getByRole("button", {name: "Save"});
    await saveButton.click();

    await expect(page).toHaveURL("/boards/templates");
  });

  templateTest("should edit the visibility of a column on a custom template", async ({page, template}) => {
    await page.goto("/boards/templates");

    const templateSection = page.getByRole("region", {name: "Your Templates"});
    await expect(templateSection).toBeVisible();

    const selectedTemplate = templateSection.getByRole("group", {name: template.templateName});
    const menu = selectedTemplate.getByRole("button", {name: "Template options"});
    await menu.click();

    const editButton = selectedTemplate.getByRole("button", {name: "Edit"});
    await editButton.click();

    await expect(page).toHaveURL(`/boards/edit-template/${template.templateId}`);

    const firstColumn = page.getByRole("button", {name: "This"});
    const visibility = firstColumn.getByRole("button", {name: "Hide column"});
    await visibility.click();

    const saveButton = page.getByRole("button", {name: "Save"});
    await saveButton.click();

    await expect(page).toHaveURL("/boards/templates");
  });

  templateTest("should drag and swap first and second columns on custom template", async ({page, template}) => {
    await page.goto("/boards/templates");

    const templateSection = page.getByRole("region", {name: "Your Templates"});
    await expect(templateSection).toBeVisible();

    const selectedTemplate = templateSection.getByRole("group", {name: template.templateName});
    const menu = selectedTemplate.getByRole("button", {name: "Template options"});
    await menu.click();

    const editButton = selectedTemplate.getByRole("button", {name: "Edit"});
    await editButton.click();

    await expect(page).toHaveURL(`/boards/edit-template/${template.templateId}`);

    const firstColumn = page.getByRole("button", {name: "This"});
    const secondColumn = page.getByRole("button", {name: "That"});

    const dragHandle = firstColumn.getByRole("button", {name: "Drag column"});
    await dragHandle.dragTo(secondColumn);

    const saveButton = page.getByRole("button", {name: "Save"});
    await saveButton.click();

    await expect(page).toHaveURL("/boards/templates");
  });
});
