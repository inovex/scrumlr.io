/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe("templates", () => {
  beforeEach(cy.login)

  it("should create board from recommended template", () => {
    cy
      // select template
      .get<HTMLDivElement>("[data-cy='template-card--RECOMMENDED']")
      .first()
      .find<HTMLButtonElement>("[data-cy='template-card__start-button']")
      .first()
      .click()
      // select access setting (default public) and click button to start session
      .get("[data-cy='access-settings__start-button']")
      .click()

    cy
      .url()
      .should("not.include", "/boards/templates") // not on templates anymore
      .should("include", "/board")
  })

  it("should create a new template with default settings", () => {
    cy
      .createCustomTemplate("Custom Template")

    cy
      .url()
      .should("include", "/boards/templates") // we're so back

    cy.get("[data-cy='template-card--CUSTOM']")
      .should("have.length", 1)
  });

  it("should delete custom template", () => {
    cy
      .createCustomTemplate("Del Template")

    cy.selectMiniMenu("template-card__menu", "Delete")

    cy.get("[data-cy='template-card--CUSTOM']")
      .should("not.exist")
  });

  it("should edit custom template", () => {
    cy
      .createCustomTemplate("Edit Template")

    cy
      .selectMiniMenu("template-card__menu", "Edit")

    cy
      .get("[data-cy='columns-configurator-column__color-picker']")
      .first()
      .click()

    cy
      .get("[data-cy='columns-configurator-column__color-picker--goal-green']")
      .click()

    cy
      .get("[data-cy='columns-configurator-column__icon--visibility']")
      .click({multiple:true})

    // cannot get it to work, oh well
    cy
      .get("[data-cy='columns-configurator-column__drag-element']")
      .first()
      .trigger("mousedown", {force: true, button: 0})
      .trigger("mousemove", {clientX:1000, clientY:300, force: true})
      .trigger("mouseup", {force:true})

    cy
      .get<HTMLButtonElement>("[data-cy='template-editor__button--create']")
      .click()

  });
})
